import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from './themes/ThemeProvider.tsx';
import { ThemeSwitcher } from './components/ThemeSwitcher.tsx';
import { SettingsDrawer } from './components/SettingsDrawer.tsx';
import { Wheel } from './components/Wheel.tsx';
import { QuestionCard } from './components/QuestionCard.tsx';
import { ResultPanel } from './components/ResultPanel.tsx';
import { HistoryPanel, type HistoryItem } from './components/HistoryPanel.tsx';
import { Toast } from './components/Toast.tsx';
import { askOracle, type OracleResponse } from './api/oracleClient.ts';
import { Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from './utils/audio.ts';

const LOADING_MESSAGES = [
  "Rippling the fabric of causality...",
  "Consulting the collective echo...",
  "Observing Schrödinger's result...",
  "Mapping the probability void...",
  "Whispering to the latent space...",
  "Collapsing the wave function..."
];

const App: React.FC = () => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState({
    // Hardcoded default base URL for the live app
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://lucky-ai-api-664189756248.europe-west1.run.app',
    reduceMotion: false,
    soundEnabled: true,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [oracleResult, setOracleResult] = useState<OracleResponse | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [flashTrigger, setFlashTrigger] = useState(false);

  useEffect(() => {
    soundEngine.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('oracle_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Clean up old deprecated settings
        setSettings(prev => ({ ...prev, ...parsed }));
      }
      const savedHistory = localStorage.getItem('oracle_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) { }
  }, []);

  useEffect(() => {
    localStorage.setItem('oracle_settings', JSON.stringify(settings));
    localStorage.setItem('oracle_history', JSON.stringify(history));
  }, [settings, history]);

  useEffect(() => {
    let interval: number | undefined;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAsk = useCallback(async (question: string) => {
    if (!question.trim()) return;
    setLoading(true);
    setShowResult(false);
    setOracleResult(null);
    setCurrentQuestion(question);

    soundEngine.playWhoosh();

    try {
      // Pass baseUrl to oracle client
      const res = await askOracle(question, {
        baseUrl: settings.baseUrl,
      });
      setOracleResult(res);
      setLoading(false);
      setIsSpinning(true);
    } catch (err: any) {
      setLoading(false);
      setToastMsg(`Oracle Silent: ${err.message}`);
    }
  }, [settings]);

  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
    setFlashTrigger(true);
    setTimeout(() => setFlashTrigger(false), 600);
    setShowResult(true);
    if (oracleResult) {
      setHistory(prev => [{ question: currentQuestion, result: oracleResult, timestamp: Date.now() }, ...prev].slice(0, 10));
    }
  }, [oracleResult, currentQuestion]);

  const isDTU = theme.id === 'dtu';

  return (
    <div className={`flex-1 min-h-screen flex flex-col relative overflow-x-hidden ${theme.bg}`}>

      <SettingsDrawer
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} onUpdate={setSettings}
        onTestApi={() => setToastMsg("Resonance Verified.")}
      />

      <AnimatePresence>
        {flashTrigger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[190] pointer-events-none mix-blend-screen bg-white"
          />
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-1000 overflow-hidden">
        {theme.id === 'noir' && <div className="grain" />}
        <AnimatePresence mode="wait">
          {/* Hide ambient blobs for Blueprint theme to keep it clean */}
          {theme.ambientEffect !== 'grid' && (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <div className="absolute top-[-30%] left-[-10%] w-[80%] h-[80%] blur-[250px] rounded-full opacity-10" style={{ background: theme.wheelColors[0] }} />
              <div className="absolute bottom-[-30%] right-[-10%] w-[80%] h-[80%] blur-[250px] rounded-full opacity-10" style={{ background: theme.wheelColors[1] }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <header className="w-full max-w-7xl mx-auto px-10 pt-12 pb-16 flex justify-between items-start relative z-[100]">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-2"
        >
          <h1 className={`text-5xl md:text-7xl font-black tracking-tighter uppercase ${theme.text} leading-none italic`}>
            {theme.id === 'noir' ? 'ORACLE' : 'THE ORACLE'}
          </h1>
          <div className="flex items-center gap-4">
            <div className={`h-[2px] w-16 ${theme.text} opacity-20 rounded-full`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.6em] opacity-40 ${theme.text} ${isDTU ? 'font-mono' : ''}`}>Inference Interface</span>
          </div>
        </motion.div>

        <div className="flex gap-5">
          <ThemeSwitcher />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-6 rounded-[2rem] ${theme.cardBg} ${theme.text} border-2 ${theme.border} hover:scale-110 active:scale-95 transition-all shadow-2xl backdrop-blur-3xl cursor-pointer`}
          >
            <SettingsIcon size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start relative z-10 pb-20">
        <div className="lg:col-span-4 flex flex-col gap-12 lg:sticky lg:top-12 h-fit">
          <QuestionCard onAsk={handleAsk} isLoading={loading || isSpinning} />
          <HistoryPanel history={history} onSelect={(item) => {
            if (loading || isSpinning) return;
            setCurrentQuestion(item.question);
            setOracleResult(item.result);
            setShowResult(false);
            setIsSpinning(true);
          }} />
        </div>

        <div className="lg:col-span-8 flex flex-col items-center relative min-h-[600px]">
          <div className="relative w-full flex justify-center items-center">

            <div className={`relative transition-all duration-1000 w-full flex justify-center ${showResult ? 'scale-[0.85] opacity-5 blur-[60px] translate-y-[-50px] grayscale pointer-events-none' : 'scale-100 opacity-100'}`}>
              <Wheel
                p_yes={oracleResult?.p_yes ?? 0.5}
                spinning={isSpinning}
                outcome={oracleResult?.answer ?? null}
                onSpinComplete={handleSpinComplete}
                reduceMotion={settings.reduceMotion}
              />

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[60px] rounded-full z-[150] border-[20px] border-white/5 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
                    <Loader2 className={`animate-spin ${theme.text} mb-10`} size={120} strokeWidth={1} />
                    <motion.div
                      key={loadingMsgIdx}
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
                      className={`text-[11px] font-black uppercase tracking-[0.5em] text-center px-16 leading-loose relative ${theme.text} ${isDTU ? 'font-mono' : ''}`}
                    >
                      {isDTU ? "Compiling intuition..." : LOADING_MESSAGES[loadingMsgIdx]}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-[120] pointer-events-none">
              <AnimatePresence mode="wait">
                {showResult && oracleResult && (
                  <div className="pointer-events-auto w-full">
                    <ResultPanel
                      result={oracleResult}
                      question={currentQuestion}
                      onReset={() => { setShowResult(false); setOracleResult(null); setCurrentQuestion(""); }}
                      onCopy={() => setToastMsg("Fate synchronized.")}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full mt-10">
            <AnimatePresence>
              {!showResult && !isSpinning && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.2, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`text-center py-20 px-10 border-2 border-dashed ${theme.border} ${theme.radius} ${theme.text} font-black uppercase tracking-[0.6em] text-[10px] w-full ${isDTU ? 'font-mono' : ''}`}
                >
                  {isDTU ? 'Awaiting Input Parameters' : 'Cast your inquiry into the void'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </div>
  );
};

export default App;
