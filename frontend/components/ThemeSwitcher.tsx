
import React, { useState } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../themes/ThemeProvider.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeId } from '../themes/themes.ts';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setThemeId, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: ThemeId) => {
    setThemeId(id);
    setIsOpen(false);
  };

  return (
    <div className="relative z-[100]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-6 py-4 rounded-3xl ${theme.cardBg} ${theme.text} border-2 ${theme.border} hover:scale-105 active:scale-95 transition-all shadow-2xl backdrop-blur-3xl group`}
      >
        <Palette size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline text-[11px] font-black uppercase tracking-[0.3em]">Switch Realm</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[4px]" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`absolute right-0 mt-4 w-72 p-4 rounded-[2rem] z-[120] ${theme.cardBg} ${theme.border} border-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden`}
            >
              <div className={`px-4 py-3 text-[9px] font-black uppercase tracking-[0.4em] ${theme.textMuted} mb-3 border-b ${theme.border} opacity-50 flex items-center gap-2`}>
                <Sparkles size={12} /> Dimensional Shift
              </div>
              <div className="flex flex-col gap-2">
                {availableThemes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelect(t.id)}
                    className={`w-full text-left px-4 py-5 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-between rounded-2xl group relative overflow-hidden ${
                      theme.id === t.id 
                        ? `${theme.accent} text-white shadow-xl` 
                        : `hover:bg-white/5 ${theme.text}`
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div 
                          className="w-5 h-5 rounded-full border-2 border-white/20 shadow-inner" 
                          style={{ background: t.wheelColors[0] }} 
                        />
                        <div 
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white/40" 
                          style={{ background: t.wheelColors[1] }} 
                        />
                      </div>
                      <span className="relative z-10">{t.name}</span>
                    </div>
                    {theme.id === t.id && (
                      <motion.div layoutId="realm-active">
                        <Check size={18} strokeWidth={4} />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
