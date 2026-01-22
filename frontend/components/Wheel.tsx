
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from '../themes/ThemeProvider';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Sparkle } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface WheelProps {
  p_yes: number;
  spinning: boolean;
  outcome: "yes" | "no" | null;
  onSpinComplete: () => void;
  reduceMotion: boolean;
}

export const Wheel: React.FC<WheelProps> = ({ p_yes, spinning, outcome, onSpinComplete, reduceMotion }) => {
  const { theme } = useTheme();
  const [rotation, setRotation] = useState(0);
  const pointerControls = useAnimation();
  const targetRotationRef = useRef(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (spinning && outcome) {
      setIsDone(false);
      const p_yes_deg = p_yes * 360;
      
      let targetAngleOnWheel;
      const buffer = 10; 
      
      if (outcome === 'yes') {
        const min = buffer;
        const max = Math.max(buffer, p_yes_deg - buffer);
        targetAngleOnWheel = min + Math.random() * (max - min);
      } else {
        const min = p_yes_deg + buffer;
        const max = 360 - buffer;
        targetAngleOnWheel = min + Math.random() * (max - min);
      }

      const currentRot = targetRotationRef.current;
      const spins = reduceMotion ? 0 : 8 + Math.floor(Math.random() * 4); 
      
      const baseTarget = (360 - targetAngleOnWheel) % 360;
      const currentMod = currentRot % 360;
      const distance = (baseTarget - currentMod + 360) % 360;
      const finalRot = currentRot + distance + (spins * 360);
      
      targetRotationRef.current = finalRot;
      setRotation(finalRot);

      // Sound and Clacker Logic
      const duration = reduceMotion ? 1000 : 7500;
      const startTime = Date.now();
      const totalDistance = finalRot - currentRot;
      let lastTickCount = 0;

      const animatePointer = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use the same cubic-bezier(0.1, 0, 0, 1) approximation for progress
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentLogicalRotation = currentRot + (totalDistance * easedProgress);
        
        // We have 24 pins (one every 15 degrees)
        const currentTickCount = Math.floor(currentLogicalRotation / 15);

        if (currentTickCount > lastTickCount) {
          lastTickCount = currentTickCount;
          
          // Sound effect
          soundEngine.playTick();
          
          // Clacker physics: higher speed = shorter, sharper wiggles
          // lower speed = deeper, longer snaps
          const velocity = 1 - progress; // 1 at start, 0 at end
          const wiggleIntensity = 15 + (velocity * 20); // More intensity when fast
          const wiggleDuration = 0.04 + ((1 - velocity) * 0.1); // Slower snap as wheel slows

          pointerControls.start({
            rotate: [0, -wiggleIntensity, 5, 0],
            transition: { 
              duration: wiggleDuration, 
              ease: "easeOut",
              times: [0, 0.2, 0.5, 1]
            }
          });
        }

        if (progress < 1) {
          requestAnimationFrame(animatePointer);
        }
      };

      requestAnimationFrame(animatePointer);

      setTimeout(() => {
        pointerControls.start({ 
          rotate: 0, 
          transition: { type: "spring", stiffness: 400, damping: 15 } 
        });
        setIsDone(true);
        onSpinComplete();
      }, duration);
    }
  }, [spinning, outcome, p_yes, onSpinComplete, reduceMotion, pointerControls]);

  const { yesPath, x, y } = useMemo(() => {
    const angle = p_yes;
    const xVal = Math.cos(2 * Math.PI * angle);
    const yVal = Math.sin(2 * Math.PI * angle);
    const flag = angle > 0.5 ? 1 : 0;
    const path = p_yes >= 0.999 ? "M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z" 
                 : p_yes <= 0.001 ? "" 
                 : `M 0 0 L 1 0 A 1 1 0 ${flag} 1 ${xVal} ${yVal} Z`;
    return { yesPath: path, x: xVal, y: yVal };
  }, [p_yes]);

  const ringGradient = `conic-gradient(${theme.wheelColors[0]} 0% ${p_yes * 100}%, ${theme.wheelColors[1]} ${p_yes * 100}% 100%)`;

  return (
    <div className="relative w-[340px] h-[340px] sm:w-[580px] sm:h-[580px] flex items-center justify-center perspective-1000 shrink-0">
      
      <AnimatePresence>
        {isDone && (
          <motion.div 
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="absolute w-40 h-40 rounded-full z-0 blur-3xl"
            style={{ background: outcome === 'yes' ? theme.wheelColors[0] : theme.wheelColors[1] }}
          />
        )}
      </AnimatePresence>

      <div 
        className="absolute inset-[-150px] rounded-full blur-[150px] opacity-20 animate-pulse-slow pointer-events-none" 
        style={{ background: ringGradient }}
      />
      
      {/* PREMIUM POINTER (CLACKER) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[15%] z-[70] flex flex-col items-center">
        {/* Pivot/Cap */}
        <div className={`w-10 h-10 rounded-full border-4 ${theme.border} bg-white shadow-[0_5px_15px_rgba(0,0,0,0.4)] relative z-20 flex items-center justify-center`}>
          <div className="w-2 h-2 rounded-full bg-slate-400" />
        </div>
        
        <motion.div 
          animate={pointerControls} 
          style={{ originY: 0 }}
          className="relative -mt-3 pointer-events-none"
        >
          <svg 
            width="64" 
            height="110" 
            viewBox="0 0 64 110" 
            fill="none" 
            className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          >
            <defs>
              <linearGradient id="pointerGrad" x1="32" y1="0" x2="32" y2="110" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" />
                <stop offset="0.8" stopColor="#e2e8f0" />
                <stop offset="1" stopColor="#cbd5e1" />
              </linearGradient>
              <filter id="pointerInnerShadow">
                <feOffset dx="0" dy="2" />
                <feGaussianBlur stdDeviation="2" result="offset-blur" />
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                <feFlood floodColor="black" floodOpacity="0.2" result="color" />
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
              </filter>
            </defs>
            <path 
              d="M32 110L4 20C4 20 4 0 32 0C60 0 60 20 60 20L32 110Z" 
              fill="url(#pointerGrad)"
              filter="url(#pointerInnerShadow)"
            />
            {/* Gloss Highlight */}
            <path 
              d="M32 10L10 25C10 25 15 5 32 5C49 5 54 25 54 25L32 10Z" 
              fill="white" 
              fillOpacity="0.4"
            />
          </svg>
        </motion.div>
      </div>

      {/* AMBIENT ROTATING ORBIT */}
      <div 
        className={`absolute inset-[-80px] rounded-full p-[4px] transition-all duration-[7.5s] ${spinning ? 'rotate-[1800deg] opacity-100' : 'rotate-0 opacity-20'}`}
        style={{ background: ringGradient }}
      >
        <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-3xl border border-white/10 shadow-2xl"></div>
      </div>
      
      <div 
        className={`w-full h-full rounded-full relative z-10 shadow-[0_0_200px_rgba(0,0,0,0.9)] border-[24px] ${theme.border} overflow-hidden bg-black`}
        style={{
          transition: spinning ? `transform ${reduceMotion ? '1s' : '7.5s'} cubic-bezier(0.1, 0, 0, 1)` : 'none',
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <svg viewBox="-1.02 -1.02 2.04 2.04" className="w-full h-full transform -rotate-90">
            <circle cx="0" cy="0" r="1" fill={theme.wheelColors[1]} />
            {yesPath && <path d={yesPath} fill={theme.wheelColors[0]} />}
            <circle cx="0" cy="0" r="1" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.03" />
            
            <line x1="0" y1="0" x2="1" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="0.015" />
            {p_yes > 0 && p_yes < 1 && (
               <line x1="0" y1="0" x2={x} y2={y} stroke="rgba(255,255,255,0.3)" strokeWidth="0.015" />
            )}

            {p_yes > 0.1 && (
              <text 
                x={Math.cos(Math.PI * p_yes) * 0.7} 
                y={Math.sin(Math.PI * p_yes) * 0.7} 
                fill="white" 
                fontSize="0.14" 
                fontWeight="900" 
                textAnchor="middle" 
                className="font-black uppercase tracking-[0.3em] drop-shadow-2xl pointer-events-none"
              >
                YES
              </text>
            )}

            {p_yes < 0.9 && (
               <text 
                 x={Math.cos(Math.PI * (1 + p_yes)) * 0.7} 
                 y={Math.sin(Math.PI * (1 + p_yes)) * 0.7} 
                 fill="white" 
                 fontSize="0.14" 
                 fontWeight="900" 
                 textAnchor="middle" 
                 className="font-black uppercase tracking-[0.3em] drop-shadow-2xl pointer-events-none"
               >
                 NO
               </text>
            )}

            {/* MECHANICAL PINS */}
            {[...Array(24)].map((_, i) => {
               const angle = (i / 24) * 2 * Math.PI;
               return (
                 <g key={i}>
                   {/* Pin Body */}
                   <circle 
                     cx={Math.cos(angle) * 0.96} 
                     cy={Math.sin(angle) * 0.96} 
                     r="0.025" 
                     fill="#ffffff" 
                     className="shadow-xl"
                   />
                   {/* Pin Highlight */}
                   <circle 
                     cx={Math.cos(angle) * 0.95} 
                     cy={Math.sin(angle) * 0.95} 
                     r="0.01" 
                     fill="rgba(0,0,0,0.15)"
                   />
                 </g>
               );
            })}
        </svg>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      </div>
      
      <div className={`absolute w-48 h-48 rounded-full ${theme.cardBg} ${theme.border} border-4 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex items-center justify-center z-20 overflow-hidden`}>
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-black/80" />
        <motion.div 
          animate={spinning ? { scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] } : { scale: [1, 1.1, 1] }}
          transition={{ duration: spinning ? 0.4 : 5, repeat: Infinity }}
          className={`w-20 h-20 rounded-full ${theme.accent} flex items-center justify-center shadow-[0_0_50px_white/30] relative z-30`}
        >
           <Sparkle size={32} className={theme.accentText} fill="currentColor" />
        </motion.div>
        
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.15),transparent)] animate-spin-slow" />
      </div>
    </div>
  );
};
