import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/schema/schema';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  // Return singleton instance to avoid "same browser context" errors
  if (client) {
    return client;
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}