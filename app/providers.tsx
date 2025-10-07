"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { SupabaseRealtimeProvider } from "../provider/SupabaseRealtimeProvider";

// Create a query client instance with optimized settings for auth
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - cache garbage collection
      retry: 1,
      refetchOnWindowFocus: true, // Refetch on window focus for auth state
      refetchOnReconnect: true, // Refetch on reconnect
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Combined providers for easy use
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SupabaseRealtimeProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="maritime-quest-theme"
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </SupabaseRealtimeProvider>
    </QueryProvider>
  );
}