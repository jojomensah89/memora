import type { ContextType } from "@prisma/client";

/**
 * Content Processor Interface
 * Contract for processing different content types (files, URLs, GitHub, etc.)
 */

export type ProcessedContent = {
  content: string; // Extracted text
  rawContent?: string; // Original content if different
  tokens: number; // Estimated token count
  metadata?: Record<string, unknown>; // Type-specific metadata
};

export type IContentProcessor = {
  /**
   * The type of content this processor handles
   */
  readonly type: ContextType;

  /**
   * Process content and extract text
   */
  process(input: unknown): Promise<ProcessedContent>;

  /**
   * Validate input before processing
   */
  validate(input: unknown): Promise<boolean>;

  /**
   * Estimate tokens for content
   */
  estimateTokens(content: string): number;
};
