import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { NextRequest } from "next/server";

export const runtime = "edge";
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    id?: string;
    messages?: UIMessage[];
    model?: string;
  };

  const uiMessages = body.messages ?? [];
  const modelId = body.model ?? "gemini-2.5-flash";

  const result = streamText({
    model: openrouter(modelId),
    messages: convertToModelMessages(uiMessages),
  });

  // const result = streamText({
  //   model: google("gemini-2.5-flash"),
  //   messages: convertToModelMessages(uiMessages),
  // });

  return result.toUIMessageStreamResponse();
}
