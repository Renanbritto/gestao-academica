/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flwsadskdldlsbnkqqsf.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3NhZHNrZGxkbHNibmtxcXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNzI1NDMsImV4cCI6MjEwMjg0ODU0M30.JapRETGh4aN6-N80m7fibyoG4D9o99-9E2GiXmxLt6o',
  }
};

module.exports = nextConfig;
