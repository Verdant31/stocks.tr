"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const client = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
