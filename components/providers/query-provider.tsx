"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: (failureCount, error) => {
              if (
                error instanceof Error &&
                error.message.includes("429")
              ) {
                return failureCount < 3;
              }
              return failureCount < 2;
            },
            retryDelay: (attempt) => Math.pow(2, attempt) * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
