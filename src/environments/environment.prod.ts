// This file will be used for production builds
// Environment variables will be injected by Vercel at build time
declare const process: any;

export const environment = {
    production: true,
    supabaseUrl: process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
    supabaseAnonKey: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '',
    geminiApiKey: process.env['NEXT_PUBLIC_GEMINI_API_KEY'] || ''
};

