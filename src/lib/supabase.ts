import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    }
  },
  // Add retryOnError configuration
  db: {
    schema: 'public'
  }
});

// Enhanced connection test with detailed error logging
supabase.auth.getSession().then(async () => {
  try {
    // Test a simple query to verify database access
    const { data, error } = await supabase
      .from('reviews')
      .select('count')
      .limit(1)
      .single();
      
    if (error) throw error;
    console.log('Supabase connection and database access verified');
  } catch (error) {
    console.error('Supabase database access error:', {
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  }
}).catch(error => {
  console.error('Supabase connection error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    status: error.status
  });
});