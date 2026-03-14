/**
 * AI Provider Abstraction
 *
 * Switches between Ollama (local) and OpenAI (cloud) based on the
 * AI_PROVIDER environment variable.
 *
 * Set AI_PROVIDER=openai  → uses OpenAI API
 * Set AI_PROVIDER=ollama  → uses Ollama local (default)
 *
 * Exports the same interface regardless of provider:
 *   - generateEmbedding(text)
 *   - generateChatResponse(systemPrompt, userMessage)
 *   - checkHealth()
 *   - cosineSimilarity(a, b)
 *   - stripHtml(html)
 *   - extractTextFromBlocks(blocks)
 *   - EMBED_MODEL
 *   - CHAT_MODEL
 *   - PROVIDER_NAME
 */

const AI_PROVIDER = (process.env.AI_PROVIDER || 'ollama').trim().toLowerCase();

// Import provider-specific modules
const ollamaService = require('./ollamaService');
const openaiService = require('./openaiService');

// Select active provider
const activeService = AI_PROVIDER === 'openai' ? openaiService : ollamaService;

// Provider name for display in frontend
const PROVIDER_NAME = AI_PROVIDER === 'openai' ? 'OpenAI' : 'Ollama';

console.log(`[AI Provider] Using: ${PROVIDER_NAME} (AI_PROVIDER=${AI_PROVIDER})`);

/**
 * Generate embedding using the active provider.
 */
async function generateEmbedding(text) {
  return activeService.generateEmbedding(text);
}

/**
 * Generate chat response using the active provider.
 */
async function generateChatResponse(systemPrompt, userMessage) {
  return activeService.generateChatResponse(systemPrompt, userMessage);
}

/**
 * Check health of the active provider.
 * For Ollama: checks local server + model availability
 * For OpenAI: validates API key + model access
 */
async function checkHealth() {
  if (AI_PROVIDER === 'openai') {
    return openaiService.checkHealth();
  }
  return ollamaService.checkOllamaHealth();
}

// Utility functions (shared — not provider-specific)
const { cosineSimilarity, stripHtml, extractTextFromBlocks } = ollamaService;

module.exports = {
  generateEmbedding,
  generateChatResponse,
  checkHealth,
  cosineSimilarity,
  stripHtml,
  extractTextFromBlocks,
  EMBED_MODEL: activeService.EMBED_MODEL,
  CHAT_MODEL: activeService.CHAT_MODEL,
  PROVIDER_NAME,
  AI_PROVIDER
};
