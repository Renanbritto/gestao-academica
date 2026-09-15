import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-clip">
      
      {/* Orbs de Luz Neon Flutuantes para Efeito Glassmorphism de Alta Refração */}
      <div
        className="glass-orb w-96 h-96 bg-indigo-600/20 top-[-50px] left-[10%]"
        style={{ animationDuration: '12s' }}
      />
      <div
        className="glass-orb w-80 h-80 bg-pink-600/15 top-[250px] right-[5%]"
        style={{ animationDuration: '14s', animationDelay: '-3s' }}
      />
      <div
        className="glass-orb w-96 h-96 bg-sky-500/15 bottom-[100px] left-[25%]"
        style={{ animationDuration: '16s', animationDelay: '-6s' }}
      />
      <div
        className="glass-orb w-72 h-72 bg-emerald-500/10 bottom-[-50px] right-[20%]"
        style={{ animationDuration: '11s', animationDelay: '-2s' }}
      />

      {/* Header com Efeito Vidro Flutuante */}
      <div className="z-40 w-full">
        <Header />
      </div>

      {/* Conteúdo Principal com aproveitamento total da tela widescreen */}
      <div className="flex-1 flex w-full max-w-[1700px] mx-auto relative">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mobile-safe-bottom min-w-0 z-10">
          {children}
        </main>
      </div>

      {/* Barra Inferior Fixa Mobile */}
      <div className="z-50">
        <BottomNav />
      </div>

    </div>
  );
};
