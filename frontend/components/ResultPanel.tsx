import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RefreshCw, Check, Ghost, Ruler } from 'lucide-react';
import { useTheme } from '../themes/ThemeProvider.tsx';
import { type OracleResponse } from '../api/oracleClient.ts';
import { formatPercentage, getConfidenceLabel } from '../utils/format.ts';
import { soundEngine } from '../utils/audio.ts';

interface ResultPanelProps {
  result: OracleResponse;
  question: string;
  onReset: () => void;
  onCopy: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ result, question, onReset, onCopy }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
      // Play themed result sound
      soundEngine.playThemedResult(result.answer === 'yes', theme.id);
    }, 100);
    return () => clearTimeout(timer);
  }, [result.answer, theme.id]);

  const isYes = result.answer === 'yes';
  const mainColor = isYes ? theme.wheelColors[0] : theme.wheelColors[1];
  const confidence = isYes ? result.p_yes : result.p_no;
  const label = getConfidenceLabel(confidence);
  const isNoir = theme.id === 'noir';
  const isDTU = theme.id === 'dtu';

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textVariants = {
    hidden: { opacity: 0, filter: 'blur(20px)', scale: 1.5, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const
      }
    })
  };

  const characters = result.answer.toUpperCase().split("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 150, rotateX: 45, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9, transition: { duration: 0.5 } }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full max-w-2xl mx-auto p-12 md:p-16 ${theme.radius} ${theme.cardBg} ${theme.border} border-2 text-center relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] transition-all duration-700 z-[110] backdrop-blur-3xl`}
    >
      {/* DTU Technical Markings */}
      {isDTU && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#1E4D8C]/20" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#1E4D8C]/20" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#1E4D8C]/20" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#1E4D8C]/20" />
          
          <div className="absolute top-4 right-4 text-[7px] font-mono text-[#1E4D8C]/40 tracking-widest text-right">
            <div>REF: {Math.floor(Math.random() * 9000) + 1000}</div>
            <div>STATUS: FINAL</div>
          </div>
          
          <div className="absolute bottom-4 left-4 text-[7px] font-mono text-[#1E4D8C]/40 tracking-widest">
            FIG. B-2 [OUTPUT]
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {revealed && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "50%", y: "50%", scale: 0, opacity: 0 }}
            animate={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`, 
              scale: [0, Math.random() * 2, 0], 
              opacity: [0, 0.8, 0] 
            }}
            transition={{ 
              duration: 2 + Math.random() * 3, 
              delay: Math.random() * 1,
              repeat: Infinity 
            }}
            className="absolute w-2 h-2 rounded-full blur-[2px]"
            style={{ background: mainColor }}
          />
        ))}
      </div>

      <div className="relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 0.5, y: 0 }} 
          transition={{ delay: 0.3 }}
          className={`flex items-center justify-center gap-3 mb-10 text-[10px] font-black uppercase tracking-[0.6em] ${theme.textMuted} ${isDTU ? 'font-mono' : ''}`}
        >
          {isDTU ? <Ruler size={14} /> : <Ghost size={14} />} 
          {isDTU ? 'DECISION READOUT' : 'Fate has been sealed'}
        </motion.div>
        
        <div className="relative inline-flex gap-4 mb-16 px-4">
            {characters.map((char, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className={`text-8xl md:text-[10rem] lg:text-[12rem] font-black ${isNoir ? 'italic tracking-tighter' : 'tracking-normal'}`}
                style={{ 
                  color: isNoir ? 'white' : mainColor, 
                  textShadow: isNoir ? 'none' : `0 0 60px ${mainColor}40` 
                }}
              >
                {char}
              </motion.span>
            ))}
            
            <AnimatePresence>
               {revealed && theme.ambientEffect === 'glitch' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 flex justify-center gap-4 text-8xl md:text-[12rem] font-black text-rose-500 blur-sm -z-10 translate-x-4"
                  >
                    {result.answer.toUpperCase()}
                  </motion.div>
               )}
            </AnimatePresence>
        </div>
        
        <div className="flex justify-center mb-14">
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className={`px-10 py-4 rounded-full text-[11px] font-black border ${theme.border} ${theme.text} ${isDTU ? 'bg-white/80' : 'bg-black/20'} backdrop-blur-2xl uppercase tracking-[0.4em] shadow-xl ${isDTU ? 'font-mono' : ''}`}
            >
                {label} • {formatPercentage(confidence)} PROBABILITY
            </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className={`text-left p-8 md:p-10 ${theme.radius} ${isDTU ? 'bg-[#F6F7FA]' : 'bg-black/40'} border ${theme.border} mb-14 group transition-all hover:shadow-inner`}
        >
            <p className={`text-[10px] font-black mb-8 opacity-40 ${theme.text} tracking-[0.2em] ${isDTU ? 'font-mono' : ''}`}>
              {isDTU ? 'SUBJECT:' : 'QUERY:'} "{question.toUpperCase()}"
            </p>
            <div className="w-full h-4 bg-black/10 rounded-full overflow-hidden flex p-[3px] border border-black/5 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${result.p_yes * 100}%` }}
                  transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }}
                  style={{ backgroundColor: theme.wheelColors[0] }} 
                  className="h-full rounded-l-full shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${result.p_no * 100}%` }}
                  transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }}
                  style={{ backgroundColor: theme.wheelColors[1] }} 
                  className="h-full rounded-r-full shadow-[0_0_20px_rgba(255,255,255,0.2)] ml-auto" 
                />
                {/* Measurement scale for DTU */}
                {isDTU && (
                  <div className="absolute inset-0 flex justify-between px-[3px]">
                    {[...Array(21)].map((_, i) => (
                      <div key={i} className="w-[1px] h-full bg-black/10 z-10" />
                    ))}
                  </div>
                )}
            </div>
            <div className={`flex justify-between text-[11px] mt-6 font-black tracking-widest uppercase ${isDTU ? 'font-mono' : ''}`}>
                <span className="flex items-center gap-3" style={{ color: theme.wheelColors[0] }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: theme.wheelColors[0] }} /> YES {formatPercentage(result.p_yes)}
                </span>
                <span className="flex items-center gap-3" style={{ color: theme.wheelColors[1] }}>
                   NO {formatPercentage(result.p_no)} <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: theme.wheelColors[1] }} />
                </span>
            </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-stretch"
        >
            <button
                onClick={handleCopy}
                className={`flex-1 flex items-center justify-center gap-4 px-10 py-6 rounded-xl font-black text-[12px] uppercase tracking-[0.3em] transition-all ${theme.text} bg-black/5 hover:bg-black/10 border ${theme.border} backdrop-blur-3xl active:scale-95 group`}
            >
                {copied ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} className="group-hover:scale-110 transition-transform" />} 
                {copied ? 'Saved' : 'Log Result'}
            </button>
            <button
                onClick={onReset}
                className={`flex-1 flex items-center justify-center gap-4 px-10 py-6 rounded-xl font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95 ${theme.accent} ${theme.accentText} ${theme.accentHover} group`}
            >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" /> {isDTU ? 'New Experiment' : 'New Vision'}
            </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
