// =============================================================================
// CONFIGURAÇÃO DO SUPABASE - GESTÃO ACADÊMICA MONA
// =============================================================================
// Você pode colar sua URL e Chave Pública (Anon Key) diretamente abaixo,
// ou preenchê-las diretamente pela interface do aplicativo no botão "Conectar Nuvem".
// =============================================================================

const SUPABASE_DEFAULT_URL = 'https://flwsadskdldlsbnkqqsf.supabase.co';
const SUPABASE_DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3NhZHNrZGxkbHNibmtxcXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNzI1NDMsImV4cCI6MjEwMjg0ODU0M30.JapRETGh4aN6-N80m7fibyoG4D9o99-9E2GiXmxLt6o';

// Objeto de Configuração Dinâmica (Lê do localStorage ou das variáveis acima)
const SUPABASE_CONFIG = {
  getUrl: () => localStorage.getItem('mona_supabase_url') || SUPABASE_DEFAULT_URL,
  getAnonKey: () => localStorage.getItem('mona_supabase_key') || SUPABASE_DEFAULT_ANON_KEY,
  
  isConfigured: function() {
    const url = this.getUrl();
    const key = this.getAnonKey();
    return Boolean(url && key && url.startsWith('https://') && key.length > 20);
  },

  saveCredentials: function(url, key) {
    if (url) localStorage.setItem('mona_supabase_url', url.trim());
    if (key) localStorage.setItem('mona_supabase_key', key.trim());
  },

  clearCredentials: function() {
    localStorage.removeItem('mona_supabase_url');
    localStorage.removeItem('mona_supabase_key');
  }
};

// Cliente Global do Supabase
let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (SUPABASE_CONFIG.isConfigured() && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.getUrl(),
        SUPABASE_CONFIG.getAnonKey()
      );
      return supabaseClient;
    } catch (err) {
      console.error('Erro ao inicializar cliente Supabase:', err);
      return null;
    }
  }
  return null;
}
