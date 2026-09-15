# ☁️ Guia de Ativação do Banco na Nuvem (Supabase) & PWA

Este guia passo a passo explica como ativar a sincronização em tempo real entre o **Celular**, **Tablet** e **Computador** da Monalysa de forma 100% gratuita.

---

## 🚀 Passo 1: Criar seu Projeto Gratuito no Supabase (2 minutos)

1. Acesse **[supabase.com](https://supabase.com)** e crie uma conta gratuita (pode entrar com o GitHub).
2. Clique em **"New project"** (Novo Projeto).
3. Preencha:
   - **Name**: `mona-academic` (ou qualquer nome que preferir)
   - **Database Password**: Crie uma senha segura
   - **Region**: Selecione `South America (São Paulo)` para maior velocidade
   - **Pricing Plan**: `Free Plan` (Gratuito)
4. Clique em **"Create new project"** e aguarde cerca de 1 minuto enquanto o banco é criado.

---

## 🗄️ Passo 2: Executar o Script do Banco de Dados

1. No menu lateral esquerdo do Supabase, clique no ícone **SQL Editor** (ícone de terminal `>_`).
2. Clique em **"New Query"** (ou "+").
3. Abra o arquivo **`supabase-schema.sql`** que criamos na pasta do projeto, copie todo o seu conteúdo e cole no editor do Supabase.
4. Clique no botão verde **"Run"** (no canto inferior direito).
5. Pronto! As tabelas `profiles`, `subjects` e `activities` com regras de segurança (RLS) foram criadas com sucesso.

---

## 🔑 Passo 3: Obter suas Chaves e Conectar

1. No menu lateral do Supabase, clique no ícone da engrenagem **Project Settings** (Configurações do Projeto).
2. Clique em **API** no menu de configurações.
3. Você verá dois campos:
   - **Project URL**: algo como `https://xyzabcdefghijkl.supabase.co`
   - **Project API keys > `anon` `public`**: uma chave longa que começa com `eyJ...`
4. Você tem **duas formas** super simples de conectar:

### Opção A (Direto pelo Navegador):
Abra o site, clique no botão **"Conectar Nuvem"** no topo ou no rodapé e cole a **Project URL** e a **Anon Key**. Clique em **Salvar e Conectar**.

### Opção B (No código para ficar fixo na Vercel):
Abra o arquivo `supabase-config.js` e preencha as duas constantes:
```javascript
const SUPABASE_DEFAULT_URL = 'https://xyzabcdefghijkl.supabase.co';
const SUPABASE_DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## 🌐 Como Usar de Forma 100% Natural (Sem Instalar Nada)

Ela **não precisa instalar nada**. O funcionamento é exatamente como um site normal:
1. Você manda o link da Vercel para ela no WhatsApp (ex: `https://mona.vercel.app`).
2. Ela clica no link pelo celular, tablet ou computador.
3. Faz o login (uma única vez) com o e-mail e senha.
4. O navegador já mantém ela conectada automaticamente. Tudo o que ela alterar em um aparelho já aparece no outro!

---

## 📱 (Opcional) Criar Atalho na Tela Inicial

Caso ela queira deixar um ícone bonito na tela do celular como se fosse um app (sem precisar digitar o link toda vez), basta:
* **No iPhone (Safari):** Tocar em *Compartilhar* > *Adicionar à Tela de Início*.
* **No Android (Chrome):** Tocar nos *3 pontinhos* > *Adicionar à tela inicial*.

---

## 🔐 Passo 5: Criar a Conta e Acessar

1. No site, clique em **"Entrar / Sincronizar"** e vá na aba **"Criar Conta"**.
2. Informe o e-mail dela e crie uma senha.
3. Pronto! A partir desse momento, qualquer nota, matéria ou atividade cadastrada no computador aparecerá instantaneamente no celular e tablet! 🎉
