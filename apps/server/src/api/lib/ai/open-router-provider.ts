import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export const openrouterModels = [
  "deepseek/deepseek-chat-v3.1:free",
  "openai/gpt-oss-20b:free",
  "qwen/qwen3-coder:free",
  "qwen/qwen3-4b:free",
  "deepseek/deepseek-r1-distill-llama-70b:free",
];
