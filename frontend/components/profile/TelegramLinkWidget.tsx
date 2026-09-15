import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TelegramLinkStatus, GenerateLinkCodeResponse } from '@/lib/types';
import { Bot, CheckCircle2, Copy, RefreshCw, Unlink, Sparkles, ExternalLink } from 'lucide-react';

export const TelegramLinkWidget: React.FC = () => {
  const [status, setStatus] = useState<TelegramLinkStatus | null>(null);
  const [linkCodeData, setLinkCodeData] = useState<GenerateLinkCodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/telegram/status');
      setStatus(res.data);
    } catch (e) {
      console.warn('Erro ao carregar status do Telegram:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/telegram/generate-code');
      setLinkCodeData(res.data);
    } catch (e) {
      console.warn('Erro ao gerar código Telegram:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Deseja realmente desvincular seu bot do Telegram?')) return;
    try {
      await api.delete('/telegram/unlink');
      setLinkCodeData(null);
      await fetchStatus();
    } catch (e) {
      console.warn('Erro ao desvincular:', e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-card to-card">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Bot size={22} />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
              <span>IO no Telegram com Gemini IA</span>
              <Sparkles size={14} className="text-pink-400" />
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              Receba avisos de provas e pergunte dúvidas de matérias diretamente no chat.
            </p>
          </div>
        </div>

        {status?.isLinked && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle2 size={13} />
            <span>Vinculado</span>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-xs text-[var(--text-muted)] animate-pulse">
          Verificando status de conexão com o Telegram...
        </div>
      ) : status?.isLinked ? (
        <div className="space-y-3 bg-card/60 p-4 rounded-xl border border-card-border">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-muted)]">Conta do Telegram:</span>
            <span className="font-bold text-[var(--text-main)]">
              {status.username ? `@${status.username}` : `ID: ${status.chatId}`}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-muted)]">Lembretes automáticos:</span>
            <span className="text-emerald-400 font-bold">Ativados (08:00 e 20:00)</span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-card-border">
            <button
              onClick={handleUnlink}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Unlink size={13} />
              <span>Desvincular Telegram</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Para ativar seu assistente, gere um código temporário de 6 dígitos e envie no chat do bot no Telegram.
          </p>

          {!linkCodeData ? (
            <button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={15} />
              <span>{isGenerating ? 'Gerando código...' : 'Gerar Código de Vinculação'}</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
              <div className="text-center">
                <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider block">
                  Seu Código de Vinculação (Válido por 15 min):
                </span>
                <div className="text-3xl font-display font-black tracking-widest text-indigo-400 my-1">
                  {linkCodeData.code}
                </div>
              </div>

              <div className="p-3 bg-card rounded-xl border border-card-border text-xs text-[var(--text-muted)] space-y-1">
                <div className="font-bold text-[var(--text-main)] mb-1">Como conectar:</div>
                <div>1. Abra o Telegram e pesquise <strong>@{linkCodeData.botUsername}</strong></div>
                <div>2. Envie o comando exato:</div>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg font-mono text-indigo-300 my-1">
                  <span>/vincular {linkCodeData.code}</span>
                  <button
                    onClick={() => handleCopy(`/vincular ${linkCodeData.code}`)}
                    className="p-1 hover:text-white"
                    title="Copiar comando"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                {copied && <span className="text-[10px] text-emerald-400 font-bold block text-right">Copiado!</span>}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchStatus}
                  className="flex-1 py-2 rounded-xl bg-card border border-card-border hover:border-indigo-500 text-xs font-semibold text-[var(--text-main)] flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  <span>Já enviei, verificar conexão</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
