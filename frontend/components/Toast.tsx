import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../themes/ThemeProvider';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const { theme } = useTheme();

  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full ${theme.accent} ${theme.shadow} shadow-lg text-white font-bold text-sm tracking-wide`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};