/**
 * Token Counter Utility
 * Estimates tokens for text (rough approximation)
 * For accurate counting, integrate tiktoken or provider-specific tokenizers
 */

/**
 * Rough token estimation (1 token ≈ 4 characters for English)
 * This is a simple heuristic - for production, use proper tokenizers
 */
export function estimateTokens(text: string): number {
  if (!text) {
    return 0;
  }

  // Remove extra whitespace
  const cleaned = text.trim().replace(/\s+/g, " ");

  // Rough estimation: 4 chars = 1 token
  const charCount = cleaned.length;
  const tokenEstimate = Math.ceil(charCount / 4);

  return tokenEstimate;
}

/**
 * Estimate tokens for multiple texts
 */
export function estimateTokensForArray(texts: string[]): number {
  return texts.reduce((total, text) => total + estimateTokens(text), 0);
}

/**
 * Estimate tokens for a conversation
 */
export function estimateConversationTokens(
  messages: Array<{ role: string; content: string }>
): number {
  // Each message has overhead (role, formatting)
  const MESSAGE_OVERHEAD = 4;

  return messages.reduce((total, message) => {
    const contentTokens = estimateTokens(message.content);
    const roleTokens = estimateTokens(message.role);
    return total + contentTokens + roleTokens + MESSAGE_OVERHEAD;
  }, 0);
}

/**
 * Check if text exceeds token limit
 */
export function exceedsTokenLimit(text: string, limit: number): boolean {
  return estimateTokens(text) > limit;
}

/**
 * Truncate text to fit within token limit
 */
export function truncateToTokenLimit(text: string, limit: number): string {
  const estimated = estimateTokens(text);

  if (estimated <= limit) {
    return text;
  }

  // Calculate approximate character limit
  const charLimit = limit * 4;
  return `${text.slice(0, charLimit)}...`;
}
