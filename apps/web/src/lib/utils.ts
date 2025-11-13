import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Model = {
  provider: string;
  modelId: string;
  name: string;
};

export async function fetchModels(): Promise<Model[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/streaming/models`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    // Fallback to basic Gemini models if API fails
    return [
      {
        provider: "GEMINI",
        modelId: "gemini-2.0-flash-exp",
        name: "Gemini 2.0 Flash",
      },
      {
        provider: "GEMINI",
        modelId: "gemini-1.5-pro-latest",
        name: "Gemini 1.5 Pro",
      },
    ];
  }

  const data = await response.json();
  return data.models || [];
}
