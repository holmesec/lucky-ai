import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Volume2 } from 'lucide-react';
import { useTheme } from '../themes/ThemeProvider';

interface Settings {
  baseUrl: string; // Kept in state but hidden from UI
  reduceMotion: boolean;
  soundEnabled: boolean;
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onTestApi: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdate,
}) => {
  const { theme } = useTheme();

  const toggle = (key: keyof Settings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-[200] backdrop-blur-2xl"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-y-0 right-0 w-full sm:w-[480px] z-[210] ${theme.cardBg} border-l-4 ${theme.border} p-10 overflow-y-auto shadow-[-50px_0_120px_rgba(0,0,0,1)] flex flex-col scrollbar-hide`}
          >
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className={`text-3xl font-black uppercase tracking-tighter ${theme.text}`}>Settings</h2>
                <p className={`text-[9px] font-black uppercase tracking-[0.4em] opacity-30 ${theme.text}`}>System Controls</p>
              </div>
              <button 
                onClick={onClose} 
                className={`w-14 h-14 flex items-center justify-center rounded-3xl hover:bg-white/10 active:scale-90 ${theme.text} transition-all border-4 ${theme.border} bg-white/5 cursor-pointer shadow-lg`}
              >
                <X size={28} strokeWidth={4} />
              </button>
            </div>

            <div className="space-y-10 flex-1">
              <div className="space-y-6 px-4">
                {[
                  { id: 'soundEnabled', label: 'Auditory Feed', desc: 'Global sound output', icon: Volume2 },
                  { id: 'reduceMotion', label: 'Reduce Motion', desc: 'Simplify animations', icon: Zap }
                ].map((item) => {
                  const Icon = item.icon;
                  const val = (settings as any)[item.id];
                  return (
                    <div key={item.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl bg-black/40 ${theme.text} border-2 ${theme.border} group-hover:scale-110 transition-transform`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className={`font-black text-[11px] uppercase tracking-widest ${theme.text}`}>{item.label}</h3>
                          <p className={`text-[9px] font-bold opacity-30 ${theme.text}`}>{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggle(item.id as any)}
                        className={`w-16 h-8 rounded-full transition-all relative ${val ? theme.accent : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: val ? 34 : 4 }}
                          className="absolute top-1 left-0 bg-white w-6 h-6 rounded-full shadow-lg" 
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className={`mt-12 pt-10 text-center border-t-2 ${theme.border} opacity-20 ${theme.text} pb-4`}>
               <p className="text-[10px] font-black uppercase tracking-[0.5em]">SYSTEM ONLINE</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
