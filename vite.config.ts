// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => { // Add 'mode' parameter here
  // Log environment variables during Vite configuration
  console.log('Vite Config: Current mode:', mode);
  console.log('Vite Config: VITE_SUPABASE_URL from .env:', process.env.VITE_SUPABASE_URL); // Use process.env here
  console.log('Vite Config: VITE_SUPABASE_ANON_KEY from .env (first 5 chars):', process.env.VITE_SUPABASE_ANON_KEY ? process.env.VITE_SUPABASE_ANON_KEY.substring(0, 5) + '...' : 'Not found');

  return {
    plugins: [react()],
  };
});