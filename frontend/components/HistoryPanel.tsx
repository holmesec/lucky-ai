
import React from 'react';
import { useTheme } from '../themes/ThemeProvider.tsx';
import { type OracleResponse } from '../api/oracleClient.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, History } from 'lucide-react';

export interface HistoryItem {
  question: string;
  result: OracleResponse;
  timestamp: number;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  const { theme } = useTheme();

  return (
    <div className={`mt-12 w-full max-w-md mx-auto`}>
      <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${theme.textMuted}`}>
        <Clock size={16} /> Recent Visions
      </h3>
      <div className="space-y-3 min-h-[100px]">
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className={`flex flex-col items-center justify-center py-8 border-2 border-dashed ${theme.border} rounded-xl`}
            >
              <History size={24} className="mb-2" />
              <p className="text-xs uppercase tracking-tighter">Your fate is yet to be written</p>
            </motion.div>
          ) : (
            history.map((item, idx) => (
              <motion.div
                key={item.timestamp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelect(item)}
                className={`p-3 rounded-lg cursor-pointer border hover:border-current transition-all group ${theme.cardBg} ${theme.border} shadow-sm active:scale-[0.98]`}
              >
                <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium truncate w-3/4 ${theme.text}`}>{item.question}</p>
                    <span 
                        className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            item.result.answer === 'yes' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        } border border-current`}
                    >
                        {item.result.answer.toUpperCase()}
                    </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <p className={`text-[10px] opacity-60 ${theme.textMuted}`}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className={`text-[10px] font-bold ${theme.textMuted}`}>
                        {Math.round(Math.max(item.result.p_yes, item.result.p_no) * 100)}% Confidence
                    </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
