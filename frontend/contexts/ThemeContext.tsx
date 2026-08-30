import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  accentColor: string;
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [theme, setTheme] = useState<Theme>('dark');
  const [accentColor, setAccentColorState] = useState<string>('#6366f1');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('lo_theme') as Theme) || profile?.theme || 'dark';
    const savedColor = localStorage.getItem('lo_accent_color') || profile?.accentColor || '#6366f1';

    setTheme(savedTheme);
    setAccentColorState(savedColor);

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.setProperty('--accent-primary', savedColor);
  }, [profile]);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lo_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    // Salva no backend se logado
    if (profile) {
      api.put('/profile', { ...profile, theme: newTheme }).catch(() => {});
    }
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem('lo_accent_color', color);
    document.documentElement.style.setProperty('--accent-primary', color);

    if (profile) {
      api.put('/profile', { ...profile, accentColor: color }).catch(() => {});
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
};
