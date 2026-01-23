import React, { useState, useMemo } from 'react';
import { useTheme } from '../themes/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface QuestionCardProps {
  onAsk: (q: string) => void;
  isLoading: boolean;
}

const QUESTION_POOL = [
  "Is Lasse actually a secret agent?",
  "Should Lasse buy a solid gold pizza?",
  "Is Lasse the chosen one of the prophecy?",
  "Will Lasse ever find his missing left sock?",
  "Is Lasse's beard actually magical?",
  "Should Lasse be the next King of Denmark?",
  "Is Lasse taller than a medium-sized tree?",
  "Can Lasse communicate with squirrels?",
  "Is Lasse actually three ducks in a trench coat?",
  "Does Lasse know the forbidden dance?",
  "Is Lasse the reason the internet exists?",
  "Should Lasse start a professional kite-flying team?",
  "Is Lasse's smile worth a billion dollars?",
  "Does Lasse think in binary code?",
  "Is Lasse the strongest man in his living room?",
  "Will Lasse win a Grammy for his humming?",
  "Is Lasse's middle name actually 'Entropy'?",
  "Should Lasse live on a boat made of cheese?",
  "Is Lasse a master of psychic paper-folding?",
  "Does Lasse own a secret moon base?",
  "Is cereal technically a cold soup?",
  "Will robots take over by next Tuesday?",
  "Is a hotdog actually a vertical sandwich?",
  "Should I eat a second breakfast right now?",
  "Is the moon made of expired cream cheese?",
  "Will my cat ever reveal its true agenda?",
  "Should I start speaking exclusively in rhymes?",
  "Is water actually wet, or does it make things wet?",
  "Will I become a professional nap-taker?",
  "Is the universe just a giant marble?",
  "Should I give up my career to herd llamas?",
  "Is luck just a glitch in the simulation?",
  "Will I finally understand how magnets work?",
  "Should I dye my hair the color of the void?",
  "Is time just a social construct for napping?",
  "Will I ever win an argument with a microwave?",
  "Is my neighbor a friendly extraterrestrial?",
  "Should I invest everything in magic beans?",
  "Is the answer to everything really 42?",
  "Will I ever find the end of the internet?"
];

export const QuestionCard: React.FC<QuestionCardProps> = ({ onAsk, isLoading }) => {
  const { theme } = useTheme();
  const [question, setQuestion] = useState("");
  const [seed, setSeed] = useState(0);

  // Get 4 random questions from the pool
  const visibleExamples = useMemo(() => {
    const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim() || isLoading) return;
    onAsk(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSeed(s => s + 1);
  };

  const handleFocus = () => {
    if (!isLoading) {
      soundEngine.playChime();
    }
  };

  const isDTU = theme.id === 'dtu';

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`w-full max-w-md mx-auto p-8 sm:p-10 ${theme.radius} ${theme.cardBg} ${theme.border} border-2 shadow-2xl relative overflow-hidden flex flex-col`}
      style={{ height: '620px', minHeight: '620px' }} 
    >
      {/* DTU Technical Markings */}
      {isDTU && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#1E4D8C]/20" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#1E4D8C]/20" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#1E4D8C]/20" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#1E4D8C]/20" />
          <div className="absolute top-3 left-3 text-[7px] font-mono text-[#1E4D8C]/40 tracking-widest">FIG. A-1</div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full relative z-10">
        <label className={`block text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-50 ${theme.text} shrink-0 ${isDTU ? 'font-mono' : ''}`}>
          {isDTU ? 'Input Parameters' : 'Consult the Void'}
        </label>
        
        <div className="relative group mb-4 flex-1 flex flex-col min-h-0">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={isDTU ? "Define experiment variables..." : "Type your yes/no question..."}
            disabled={isLoading}
            className={`w-full flex-1 p-5 rounded-2xl resize-none ${isDTU ? 'bg-[#F6F7FA]' : 'bg-black/20'} ${theme.text} ${theme.border} border-2 focus:border-current outline-none transition-all placeholder:opacity-20 font-medium text-sm leading-relaxed ${isLoading ? 'opacity-40 grayscale' : isDTU ? 'focus:bg-white' : 'focus:bg-black/40'}`}
            style={{ 
              boxSizing: 'border-box',
              lineHeight: '1.4',
              minHeight: '80px'
            }}
          />
          <div className={`absolute bottom-4 right-4 transition-opacity pointer-events-none ${question.trim() && !isLoading ? 'opacity-40' : 'opacity-0'}`}>
            <Send size={14} className={theme.text} />
          </div>
        </div>

        {/* Improved Examples Section - Vertical List with better text visibility */}
        <div className="mb-6 shrink-0">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className={`text-[9px] font-black uppercase tracking-widest opacity-30 ${theme.text} ${isDTU ? 'font-mono' : ''}`}>
              {isDTU ? 'Standard Test Vectors' : "Oracle's Whims"}
            </span>
            <button 
              onClick={handleShuffle}
              disabled={isLoading}
              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${theme.text} disabled:opacity-0 active:scale-90`}
              title="Shuffle options"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="flex flex-col gap-2 min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={seed}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
                className="contents"
              >
                {visibleExamples.map((ex) => (
                  <motion.button
                    key={ex}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    onClick={() => setQuestion(ex)}
                    disabled={isLoading}
                    className={`text-[8px] font-black uppercase tracking-[0.15em] px-4 py-3.5 rounded-xl border ${theme.border} ${theme.textMuted} hover:bg-black/5 transition-all hover:translate-x-1 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed text-left bg-black/5 w-full flex items-start gap-3 group ${isDTU ? 'font-mono' : ''}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30 shrink-0 mt-1 transition-all group-hover:scale-125 group-hover:opacity-100" />
                    <span className="leading-tight overflow-hidden text-ellipsis">{ex}</span>
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={isLoading || !question.trim()}
          className={`w-full h-16 rounded-xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] disabled:opacity-30 disabled:grayscale shrink-0 ${theme.accent} ${theme.accentText} ${theme.accentHover}`}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="animate-spin" size={18} />
                <span>{isDTU ? 'Computing...' : 'Consulting...'}</span>
              </motion.div>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isDTU ? 'RUN EXPERIMENT' : 'Inquire'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};