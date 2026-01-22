
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { type Theme, type ThemeId, themes } from './themes.ts';

interface ThemeContextType {
  theme: Theme;
  setThemeId: (id: ThemeId) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>('cyber');

  // Load saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oracle_theme') as ThemeId;
      if (saved && themes[saved]) {
        console.log(`Oracle: Realm initialized to [${saved}]`);
        setThemeIdState(saved);
      }
    } catch (e) {
      console.warn('LocalStorage read failed', e);
    }
  }, []);

  const setThemeId = (id: ThemeId) => {
    if (!themes[id]) return;
    console.log(`Oracle: Realm shift to -> ${id}`);
    setThemeIdState(id);
    try {
      localStorage.setItem('oracle_theme', id);
    } catch (e) {
      // Ignore
    }
  };

  const currentTheme = themes[themeId] || themes.cyber;
  const availableThemesList = useMemo(() => Object.values(themes), []);

  const contextValue = useMemo(() => ({
    theme: currentTheme,
    setThemeId,
    availableThemes: availableThemesList
  }), [currentTheme, availableThemesList]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <div 
        id="theme-root"
        className={`min-h-screen w-full transition-all duration-700 ease-in-out ${currentTheme.bg} ${currentTheme.font} overflow-x-hidden flex flex-col`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
