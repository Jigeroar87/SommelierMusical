import { createClient } from '@supabase/supabase-js';

let rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

// Limpieza de URL: supabase-js ya agrega /rest/v1 automáticamente.
// Si el usuario pegó la URL con eso, o con un slash final, lo removemos.
let supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

// Diagnóstico de configuración
console.log('[Supabase] Validating config...');
console.log('[Supabase] Original URL length:', rawUrl.length);
console.log('[Supabase] Cleaned URL:', supabaseUrl);
console.log('[Supabase] URL starts with https://:', supabaseUrl.startsWith('https://'));
console.log('[Supabase] URL ends with .supabase.co:', supabaseUrl.endsWith('.supabase.co'));

if (supabaseUrl && !supabaseUrl.endsWith('.supabase.co')) {
  console.warn('[Supabase] ADVERTENCIA: La URL limpia no termina en .supabase.co. Valor actual:', supabaseUrl);
}

if (supabaseUrl.includes('supabase.com/dashboard')) {
  console.error('[Supabase] ERROR: VITE_SUPABASE_URL debe ser el Project URL (https://xxxxx.supabase.co), no la URL del dashboard.');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
