/**
 * Streaming Routes
 * Minimal implementation: forward UI messages to the AI model and stream back the response.
 * No validation, persistence, or context/rules.
 */

import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, streamText, tool, type UIMessage } from "ai";

import { Hono } from "hono";
import {
  getDefaultModel,
  getModelInstance,
  getProviderFromModel,
} from "../lib/ai/provider-factory";
import type { AuthVariables } from "../types/auth.types";
import type { AppContext } from "../types/hono.types";
import z from "zod";

import { ChatService } from "../modules/chat/chat.service";

const app = new Hono<{ Variables: AuthVariables }>();

const messageMetadataSchema = z.object({
  createdAt: z.number().optional(),
  totalTokens: z.number().optional(),
}


);

type MessageMetadata = z.infer<typeof messageMetadataSchema>;
export type MyUIMessage = UIMessage<MessageMetadata>;
type NewUiMessage = UIMessage<unknown,{
  "new-chat-created":{
    id:string
  }
}>

app.post("/", async (c: AppContext) => {
  try {
    const { messages, model}: { messages: MyUIMessage[]; model: string, webSearch: boolean } =
      await c.req.json();

    const requestedModel = model;
    const modelId = requestedModel ?? getDefaultModel("GEMINI");

    const provider = getProviderFromModel(modelId);
    const modelInstance = getModelInstance(provider, modelId);

    const result = streamText({
      model: modelInstance,
      messages: convertToModelMessages(messages),
      // providerOptions: {
      //   openai: {
      //     reasoningSummary: "auto",
      //     reasoningEffort: "low"
      //   },google:{
      //     reasoningSummary: "auto",
      //     reasoningEffort: "low"
      //   } 
      // }
    });
    return result.toUIMessageStreamResponse({
      sendReasoning:true,
      sendSources:true,
      messageMetadata: ({ part})=>{
        if(part.type === "start"){
          return {
            createdAt: Date.now(),
          };
        }
        if(part.type === "finish"){
          console.log(part.totalUsage);
          return {
            createdAt: Date.now(),
            totalTokens: part.totalUsage.totalTokens,
          };
        }
      }
    });
  } catch (error) {
    console.error("Error streaming text:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});


app.post("/extreme", async (c: AppContext) => {
  const {
    messages,
    model,
    id: chatId,
    webSearch,
  }: {
    messages: NewUiMessage[];
    model: string;
    webSearch: boolean;
    id: string;
  } = await c.req.json();
  const authUser = c.get("authUser");
  const requestedModel = model;
  const modelId = requestedModel ?? getDefaultModel("GEMINI");

  const provider = getProviderFromModel(modelId);
  const modelInstance = getModelInstance(provider, modelId);

  const chatService = new ChatService();

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      try {
        // Check if chat exists
        await chatService.getChatById(chatId, authUser.id);
      } catch (error) {
        // Chat doesn't exist, create it
        const initialMessage = messages[0]?.parts.find(p => p.type === 'text')?.text || "";
        
        await chatService.createChat(authUser.id, {
          chatId,
          modelId,
          initialMessage,
          useWebSearch:webSearch,
          attachments:[]
        });

        writer.write({
          type: "data-new-chat-created",
          data: {
             id: chatId,
          },
        });
      }

      const result = streamText({
        model: modelInstance,
        messages: convertToModelMessages(messages),
      });

      // forward the initial result to the client without the finish event:
      writer.merge(result.toUIMessageStream());
    },
    onFinish: async ({ messages: updatedMessages }) => {
      try {
        // Save the updated messages to the database
        await chatService.saveChatMessages(authUser.id, chatId, updatedMessages as unknown as MyUIMessage[]);
      } catch (error) {
        console.error("Failed to save chat messages:", error);
      }
    },
  });


  return createUIMessageStreamResponse({ stream });
});

app.get("/models", async (c: AppContext) => {
  const { getAllAvailableModels, checkAPIKeys } = await import(
    "../lib/ai/provider-factory"
  );

  const models = getAllAvailableModels();
  const keys = checkAPIKeys();

  const filtered = models.filter((model) => {
    if (model.provider === "GEMINI") {
      return keys.gemini;
    }
    if (model.provider === "CLAUDE") {
      return keys.claude;
    }
    if (model.provider === "OPENAI") {
      return keys.openai;
    }
    if (model.provider === "OPENROUTER") {
      return keys.openrouter;
    }
    return false;
  });

  return c.json({
    models: filtered,
    default: "gemini-2.0-flash-exp",
  });
});

app.get("/health", async (c: AppContext) => {
  const { checkAPIKeys } = await import("../lib/ai/provider-factory");
  const keys = checkAPIKeys();

  return c.json({
    status: "ok",
    streaming: true,
    providers: keys,
  });
});

export default app;
