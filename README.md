# 🎓 Academia Mona — Gestão Acadêmica & Rendimento em Nuvem

Aplicação web moderna (HTML5 / CSS3 / JavaScript Vanilla) com suporte a **Banco de Dados em Nuvem (Supabase)**, autenticação de usuários, sincronização multi-dispositivo (**Celular, Tablet e Computador**), suporte a **PWA (Instalação como App Nativo)** e modo offline (**LocalStorage**).

Feito com um visual impecável em **Glassmorphism**, suporte a **Modo Claro / Escuro** e com uma mensagem especial de incentivo para a Monalysa!

---

## 🌟 Recursos

1. **Sincronização Multi-Dispositivo na Nuvem (Supabase)**:
   - Login seguro por E-mail e Senha.
   - Os dados atualizados no celular refletem imediatamente no notebook e tablet.
   - Segurança com Row Level Security (RLS) no PostgreSQL.
2. **PWA (Progressive Web App)**:
   - Pode ser instalado na tela inicial do iPhone, Android e iPad como um aplicativo nativo.
   - Funciona offline graças ao Service Worker e LocalStorage fallback.
3. **Métricas Inteligentes**:
   - Média Geral (CR) calculada automaticamente (0 a 100 pontos).
   - Semáforo de Rendimento & Pontos Faltantes para aprovação (mínimo de 70 pts) e para a meta pessoal.
   - **Calculadora de Meta**: *"Quanto preciso tirar na próxima prova?"*.
   - **Central de Avisos**: Contagem regressiva de dias com alertas coloridos por urgência (🔴 Urgente < 3d, 🟡 Atenção < 7d, 🟢 Ok > 7d).
4. **Perfil Personalizado**:
   - Upload de foto de perfil, curso, período e mensagem carinhosa.

---

## ☁️ Como Conectar ao Supabase (Guia Rápido)

Veja o passo a passo detalhado no arquivo **[`SUPABASE_GUIA.md`](SUPABASE_GUIA.md)**:
1. Crie um projeto gratuito no [Supabase](https://supabase.com).
2. Execute o script **`supabase-schema.sql`** no SQL Editor do Supabase.
3. Obtenha a **Project URL** e a **Anon Key** e cole nas configurações do app ou no arquivo `supabase-config.js`.

---

## 💻 Como Rodar Localmente

Basta abrir o arquivo **`index.html`** no seu navegador de preferência ou usar uma extensão como Live Server.

---

## 🚀 Deploy na Vercel

O projeto está pronto para deploy direto na Vercel conectando ao seu repositório Git. Todos os arquivos são servidos estaticamente com suporte total a HTTPS.
