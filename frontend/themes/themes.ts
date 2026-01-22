
export type ThemeId = 'cyber' | 'carnival' | 'pastel' | 'noir' | 'dtu';

export interface Theme {
  id: ThemeId;
  name: string;
  font: string;
  bg: string;
  text: string;
  textMuted: string;
  cardBg: string;
  accent: string;
  accentText: string;
  accentHover: string;
  border: string;
  wheelColors: [string, string];
  pointerColor: string;
  shadow: string;
  ambientEffect: 'glitch' | 'confetti' | 'sparkle' | 'vignette' | 'smoke' | 'grid';
  radius: string; // New property for controlling corner roundness
}

export const themes: Record<ThemeId, Theme> = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Occult',
    font: 'font-orbitron',
    bg: 'bg-[#02040a] bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,#02040a_100%)]',
    text: 'text-cyan-400',
    textMuted: 'text-indigo-400/60',
    cardBg: 'bg-black/40 backdrop-blur-[40px] border border-cyan-500/20',
    accent: 'bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]',
    accentText: 'text-black',
    accentHover: 'hover:bg-cyan-400 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)]',
    border: 'border-cyan-500/10',
    wheelColors: ['#06b6d4', '#d946ef'],
    pointerColor: '#ffffff',
    shadow: 'shadow-cyan-500/10',
    ambientEffect: 'glitch',
    radius: 'rounded-[3rem]',
  },
  carnival: {
    id: 'carnival',
    name: 'Mystic Fair',
    font: 'font-fredoka',
    bg: 'bg-[#1a0b2e] bg-[radial-gradient(circle_at_center,_#2d1b4d_0%,#120524_100%)]',
    text: 'text-amber-400',
    textMuted: 'text-purple-400/50',
    cardBg: 'bg-[#2d1b4d]/60 backdrop-blur-3xl border-2 border-amber-500/20',
    accent: 'bg-amber-500 shadow-xl shadow-amber-500/20',
    accentText: 'text-indigo-950',
    accentHover: 'hover:bg-amber-400 hover:scale-[1.02]',
    border: 'border-amber-500/10',
    wheelColors: ['#fbbf24', '#f43f5e'],
    pointerColor: '#ffffff',
    shadow: 'shadow-amber-500/10',
    ambientEffect: 'confetti',
    radius: 'rounded-[3rem]',
  },
  pastel: {
    id: 'pastel',
    name: 'Cloud Realm',
    font: 'font-quicksand',
    bg: 'bg-[#f8fafc] bg-[conic-gradient(at_top_right,_#fef2f2,_#eef2ff,_#f0fdf4)]',
    text: 'text-indigo-600',
    textMuted: 'text-slate-400',
    cardBg: 'bg-white/60 backdrop-blur-[30px] border border-white shadow-2xl shadow-indigo-100/50',
    accent: 'bg-gradient-to-br from-indigo-500 to-rose-400 shadow-lg shadow-indigo-200',
    accentText: 'text-white',
    accentHover: 'hover:opacity-90 hover:scale-[1.02]',
    border: 'border-white',
    wheelColors: ['#818cf8', '#f472b6'],
    pointerColor: '#fbbf24',
    shadow: 'shadow-indigo-50',
    ambientEffect: 'sparkle',
    radius: 'rounded-[3rem]',
  },
  noir: {
    id: 'noir',
    name: 'The Void',
    font: 'font-mono',
    bg: 'bg-neutral-950',
    text: 'text-neutral-100',
    textMuted: 'text-neutral-600',
    cardBg: 'bg-black border border-neutral-800 shadow-[0_0_80px_rgba(0,0,0,1)]',
    accent: 'bg-neutral-100',
    accentText: 'text-black',
    accentHover: 'hover:bg-white hover:scale-[1.01]',
    border: 'border-neutral-800',
    wheelColors: ['#171717', '#0a0a0a'],
    pointerColor: '#ef4444',
    shadow: 'shadow-black',
    ambientEffect: 'smoke',
    radius: 'rounded-[3rem]',
  },
  dtu: {
    id: 'dtu',
    name: 'DTU Blueprint',
    font: 'font-sans', // Bold Sans for headings
    bg: 'bg-blueprint', // Defined in index.html
    text: 'text-[#121417]',
    textMuted: 'text-[#1E4D8C]/70',
    cardBg: 'bg-white border border-[#1E4D8C] shadow-lg shadow-blue-900/5',
    accent: 'bg-[#990000] shadow-md shadow-red-900/20', // DTU Red
    accentText: 'text-white',
    accentHover: 'hover:bg-[#7a0000] hover:shadow-lg',
    border: 'border-[#1E4D8C]/20',
    wheelColors: ['#990000', '#1E4D8C'], // Red / Blue
    pointerColor: '#1E4D8C',
    shadow: 'shadow-blue-900/10',
    ambientEffect: 'grid',
    radius: 'rounded-xl', // Engineering squared look
  }
};
