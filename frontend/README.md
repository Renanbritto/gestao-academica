# 📱 Ió — Frontend Mobile First (Next.js 14 + Tailwind CSS)

Interface web e mobile moderna da plataforma de gestão acadêmica **Ió**, construída com **Next.js 14 (Pages Router)**, **Tailwind CSS**, componentes customizados com design Glassmorphism, **PWA** e o mascote animado **Robô Volt**.

---

## 🌟 Funcionalidades

1. **Mobile First & PWA**: Desenvolvido com foco no uso pelo celular, com Bottom Navigation Bar, interações táteis rápidas e suporte a instalação nativa.
2. **Dashboard de Rendimento**: Média Geral (CR), Semáforo de Aprovação (mínimo de 70 pts), Gráfico de Pontuação em barras e Calculadora de Meta ("Quanto preciso tirar na próxima prova").
3. **Robô Volt 3D Interativo**: Mascote com reações de olhos, fala, antenas e proteção de senha.
4. **Matérias & Ementas**: Cadastro de disciplinas com cor de identificação, professor e ementa para contextualizar a IA do Gemini.
5. **Atividades & Notas**: Cadastro de provas e trabalhos com controle de pesos e lançamento rápido de nota.
6. **Central de Avisos**: Contagem regressiva automática com semáforo de urgência colorido (🔴 Urgente < 3d, 🟡 Atenção < 7d, 🟢 No prazo).
7. **Integração com Telegram & Gemini IA**: Widget no perfil para gerar código de vinculação de 6 dígitos.

---

## 💻 Como Rodar Localmente

1. Navegue até a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra no navegador em: `http://localhost:3000`

---

## 🚀 Deploy na Vercel

Basta importar o repositório na [Vercel](https://vercel.com) e definir o **Root Directory** como `frontend`. As variáveis de ambiente públicas já estão pré-configuradas ou podem ser sobrescritas no dashboard da Vercel.
