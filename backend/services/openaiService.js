/**
 * OpenAI Service
 * Provides embedding and chat generation using the OpenAI API.
 * Drop-in alternative to ollamaService — same interface.
 *
 * Uses native https module (no external SDK required).
 */

const https = require('https');

// Support both 'sk-...' and ' sk-...' by trimming leading/trailing whitespace
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();
const OPENAI_EMBED_MODEL = (process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small').trim();
const OPENAI_CHAT_MODEL = (process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini').trim();

/**
 * Low-level HTTPS POST to the OpenAI API.
 */
function openaiRequest(path, body) {
  return new Promise((resolve, reject) => {
    if (!OPENAI_API_KEY) {
      return reject(new Error('OPENAI_API_KEY is not set in .env'));
    }

    const payload = JSON.stringify(body);
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`OpenAI API error: ${parsed.error.message}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`OpenAI parse error: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`OpenAI connection error: ${e.message}`));
    });

    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error('OpenAI request timeout (120s)'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Generate an embedding vector for the given text.
 * Model: text-embedding-3-small (1536 dimensions) or text-embedding-3-large (3072 dimensions)
 *
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - Embedding float array
 */
async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text');
  }

  // Truncate to ~8000 chars to stay within token limits
  const truncated = text.trim().slice(0, 8000);

  const result = await openaiRequest('/v1/embeddings', {
    model: OPENAI_EMBED_MODEL,
    input: truncated
  });

  if (!result.data || !result.data[0] || !result.data[0].embedding) {
    throw new Error(`OpenAI returned invalid embedding: ${JSON.stringify(result)}`);
  }

  return result.data[0].embedding;
}

/**
 * Generate a chat response using OpenAI, given a system prompt and user question.
 *
 * @param {string} systemPrompt - The RAG context / instructions for the model
 * @param {string} userMessage - The user's question
 * @returns {Promise<string>} - AI-generated response
 */
async function generateChatResponse(systemPrompt, userMessage) {
  const result = await openaiRequest('/v1/chat/completions', {
    model: OPENAI_CHAT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.3,
    top_p: 0.9,
    max_tokens: 512
  });

  if (!result.choices || !result.choices[0] || !result.choices[0].message) {
    throw new Error(`OpenAI returned no response: ${JSON.stringify(result)}`);
  }

  return result.choices[0].message.content.trim();
}

/**
 * Check if OpenAI API is accessible with the provided key.
 * @returns {Promise<{available: boolean, models: string[], missing: string[]}>}
 */
async function checkHealth() {
  try {
    if (!OPENAI_API_KEY) {
      return {
        available: false,
        models: [],
        missing: [OPENAI_EMBED_MODEL, OPENAI_CHAT_MODEL],
        error: 'OPENAI_API_KEY not configured'
      };
    }

    // Quick validation: list models endpoint (GET)
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/models',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Invalid JSON from OpenAI')); }
        });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
      req.end();
    });

    if (result.error) {
      return {
        available: false,
        models: [],
        missing: [OPENAI_EMBED_MODEL, OPENAI_CHAT_MODEL],
        error: result.error.message
      };
    }

    const modelIds = (result.data || []).map((m) => m.id);
    const required = [OPENAI_EMBED_MODEL, OPENAI_CHAT_MODEL];
    const missing = required.filter((m) => !modelIds.includes(m));

    return {
      available: true,
      models: required.filter((m) => modelIds.includes(m)),
      missing
    };
  } catch (err) {
    return {
      available: false,
      models: [],
      missing: [OPENAI_EMBED_MODEL, OPENAI_CHAT_MODEL],
      error: err.message
    };
  }
}

module.exports = {
  generateEmbedding,
  generateChatResponse,
  checkHealth,
  EMBED_MODEL: OPENAI_EMBED_MODEL,
  CHAT_MODEL: OPENAI_CHAT_MODEL
};
