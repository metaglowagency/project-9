import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  'https://pperfbptgxnablxzmwdy.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZXJmYnB0Z3huYWJseHptd2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTMxMDEsImV4cCI6MjEwNDAyOTEwMX0.JtkpJkUdMCPDqnuBIe0bS8kbLd3LLE4EkGJQ5zfvqkw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
