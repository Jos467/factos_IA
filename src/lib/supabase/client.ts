// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente público — navegador
export const supabaseClient = createClient(supabaseUrl, supabaseAnon);

// Cliente admin — solo servidor, se crea bajo demanda
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey);
}