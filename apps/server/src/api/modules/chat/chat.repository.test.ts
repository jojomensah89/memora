/**
 * Chat Repository Test Suite
 * Tests for message saving with duplicate handling
 */

import "dotenv/config"; // Load environment variables for database connection
import { describe, expect, it } from "bun:test";
import type { UIMessage } from "ai";
import * as ChatRepository from "./chat.repository";

describe("Chat Repository - Message Saving", () => {
  const testChatId = `test-chat-${Date.now()}`;
  const testUserId = `test-user-${Date.now()}`;

  describe("saveMessages with duplicate handling", () => {
    it("should save new messages successfully", async () => {
      const messages: UIMessage[] = [
        {
          id: "msg-1",
          role: "user",
          parts: [{ type: "text", text: "Hello" }],
        },
        {
          id: "msg-2",
          role: "assistant",
          parts: [{ type: "text", text: "Hi there!" }],
        },
      ];

      // This should not throw
      await expect(
        ChatRepository.saveMessages(testChatId, messages)
      ).resolves.not.toThrow();
    });

    it("should handle duplicate message IDs gracefully (upsert behavior)", async () => {
      const messages: UIMessage[] = [
        {
          id: "msg-duplicate",
          role: "user",
          parts: [{ type: "text", text: "First version" }],
        },
      ];

      // Save first time
      await ChatRepository.saveMessages(testChatId, messages);

      // Save again with same ID - should not throw
      await expect(
        ChatRepository.saveMessages(testChatId, messages)
      ).resolves.not.toThrow();

      // Saving with same ID but different content should not update (upsert with empty update)
      const messagesUpdated: UIMessage[] = [
        {
          id: "msg-duplicate",
          role: "user",
          parts: [{ type: "text", text: "Second version" }],
        },
      ];

      await expect(
        ChatRepository.saveMessages(testChatId, messagesUpdated)
      ).resolves.not.toThrow();
    });

    it("should handle multiple messages with some duplicates", async () => {
      const messages: UIMessage[] = [
        {
          id: "msg-new-1",
          role: "user",
          parts: [{ type: "text", text: "New message 1" }],
        },
        {
          id: "msg-duplicate", // This one already exists
          role: "user",
          parts: [{ type: "text", text: "Duplicate" }],
        },
        {
          id: "msg-new-2",
          role: "assistant",
          parts: [{ type: "text", text: "New message 2" }],
        },
      ];

      // Should save only new messages, skip duplicate
      await expect(
        ChatRepository.saveMessages(testChatId, messages)
      ).resolves.not.toThrow();
    });

    it("should handle messages with complex content parts", async () => {
      const messages: UIMessage[] = [
        {
          id: "msg-complex",
          role: "user",
          parts: [
            { type: "text", text: "Part 1" },
            { type: "text", text: "Part 2" },
          ],
        },
      ];

      await expect(
        ChatRepository.saveMessages(testChatId, messages)
      ).resolves.not.toThrow();
    });
  });

  describe("createChatWithMessage", () => {
    it("should create chat with initial message", async () => {
      const result = await ChatRepository.createChatWithMessage({
        userId: testUserId,
        title: "Test Chat",
        initialMessage: "Hello, world!",
        provider: "GEMINI",
        modelId: "gemini-2.0-flash-exp",
        useWebSearch: false,
        attachments: [],
        chatId: `chat-${Date.now()}`,
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("messages");
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.messages[0]!.content).toBe("Hello, world!");
    });
  });
});
