import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://reyltwmuowdrseixfbhf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleWx0d211b3dkcnNlaXhmYmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjY3MTAsImV4cCI6MjEwOTE0MjcxMH0.Gx0_QXf5V-gxtp5TQ9hoZ5fq4xzZ19fcNkkjMvM1C-o';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(url, anonKey);
}
