import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState, ReactNode } from "react";

export const Wrapper = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false
          }
        }
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
