const http = require('http');

// Strip protocol prefix if present — http.request() needs a bare hostname
const RAW_HOST = process.env.OLLAMA_HOST || 'localhost';
const OLLAMA_HOST = RAW_HOST.replace(/^https?:\/\//, '');
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'tinyllama:latest';

/**
 * Low-level HTTP POST to Ollama (no external dependencies required).
 */
function ollamaRequest(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Ollama parse error: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Ollama connection error: ${e.message}. Is Ollama running at ${OLLAMA_HOST}:${OLLAMA_PORT}?`));
    });

    req.setTimeout(180000, () => {
      req.destroy();
      reject(new Error('Ollama request timeout (180s)'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Generate a 768-dimensional embedding for the given text.
 * Model: nomic-embed-text
 *
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - 768-dimensional float array
 */
async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text');
  }

  // Truncate to ~8000 chars to stay within model context window
  const truncated = text.trim().slice(0, 8000);

  const result = await ollamaRequest('/api/embeddings', {
    model: EMBED_MODEL,
    prompt: truncated
  });

  if (!result.embedding || !Array.isArray(result.embedding)) {
    throw new Error(`Ollama returned invalid embedding: ${JSON.stringify(result)}`);
  }

  return result.embedding;
}

/**
 * Generate a chat response using phi3, given a system prompt and user question.
 *
 * @param {string} systemPrompt - The RAG context / instructions for the model
 * @param {string} userMessage - The user's question
 * @returns {Promise<string>} - AI-generated response
 */
async function generateChatResponse(systemPrompt, userMessage) {
  const fullPrompt = `${systemPrompt}\n\nUser question: ${userMessage}\n\nAnswer:`;

  const result = await ollamaRequest('/api/generate', {
    model: CHAT_MODEL,
    prompt: fullPrompt,
    stream: false,
    options: {
      temperature: 0.3,      // Lower temperature for factual RAG responses
      top_p: 0.9,
      num_predict: 512       // Max tokens in response
    }
  });

  if (!result.response) {
    throw new Error(`Ollama returned no response: ${JSON.stringify(result)}`);
  }

  return result.response.trim();
}

/**
 * Check if Ollama is available and the required models are pulled.
 * @returns {Promise<{available: boolean, models: string[], missing: string[]}>}
 */
async function checkOllamaHealth() {
  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/tags',
        method: 'GET'
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Invalid JSON from Ollama')); }
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout')); });
      req.end();
    });

    const models = (result.models || []).map((m) => m.name);
    const required = [EMBED_MODEL, CHAT_MODEL];
    const missing = required.filter((m) => !models.some((n) => n.startsWith(m.split(':')[0])));

    return { available: true, models, missing };
  } catch (err) {
    return { available: false, models: [], missing: [EMBED_MODEL, CHAT_MODEL], error: err.message };
  }
}

/**
 * Compute cosine similarity between two vectors.
 * Returns value between -1 and 1 (higher = more similar).
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Strip HTML tags and collapse whitespace from a string.
 */
function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract plain text from a blocks array (BlockEditor format).
 */
function extractTextFromBlocks(blocks = []) {
  return blocks
    .filter((b) => ['richText', 'heading', 'quote'].includes(b.type))
    .map((b) => stripHtml(b.data?.content || b.data?.text || b.data?.quote || ''))
    .join(' ')
    .trim();
}

module.exports = {
  generateEmbedding,
  generateChatResponse,
  checkOllamaHealth,
  cosineSimilarity,
  stripHtml,
  extractTextFromBlocks,
  EMBED_MODEL,
  CHAT_MODEL
};
