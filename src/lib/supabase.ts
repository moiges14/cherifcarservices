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
  db: {
    schema: 'public'
  }
});

// Enhanced error handling for connection test
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('count')
      .limit(1)
      .single();
      
    if (error) {
      console.error('Supabase database access error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }
    console.log('Supabase connection and database access verified');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Supabase connection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else {
      console.error('Unknown Supabase error:', error);
    }
  }
};

// Initialize connection test
supabase.auth.getSession().then(testConnection).catch(error => {
  console.error('Supabase auth error:', {
    message: error.message,
    name: error.name,
    stack: error.stack
  });
});