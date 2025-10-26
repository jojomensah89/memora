import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

// Helper function to add version prefix to API endpoints
const withVersion = (endpoint: string): string => {
  // Don't version these special endpoints
  const unversionedPaths = ["/api/health", "/api/auth"];
  if (unversionedPaths.some((path) => endpoint.startsWith(path))) {
    return endpoint;
  }

  // Add /api/v1 prefix to all other API routes
  const hasApiPrefix = endpoint.startsWith("/api/");
  if (hasApiPrefix) {
    return endpoint.replace("/api/", "/api/v1/");
  }

  return endpoint;
};

// REST API client for fetch-based requests
export const apiClient = {
  async get<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const versionedEndpoint = withVersion(endpoint);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}${versionedEndpoint}`,
      {
        method: "GET",
        credentials: "include",
        ...init,
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, body?: any, init?: RequestInit): Promise<T> {
    const versionedEndpoint = withVersion(endpoint);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}${versionedEndpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
        ...init,
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  },

  async put<T>(endpoint: string, body?: any, init?: RequestInit): Promise<T> {
    const versionedEndpoint = withVersion(endpoint);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}${versionedEndpoint}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
        ...init,
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  },

  async delete<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const versionedEndpoint = withVersion(endpoint);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}${versionedEndpoint}`,
      {
        method: "DELETE",
        credentials: "include",
        ...init,
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  },
};
