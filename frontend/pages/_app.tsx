import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/layout/AuthGuard';
import Head from 'next/head';

import '@/styles/globals.css';
import '@/styles/volt.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Ló — Sua Gestão Acadêmica Inteligente</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="Plataforma de gestão universitária moderna, mobile first com bot no Telegram e Gemini IA." />
      </Head>
      <AuthProvider>
        <ThemeProvider>
          <AuthGuard>
            <Component {...pageProps} />
          </AuthGuard>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}
