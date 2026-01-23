/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./themes/**/*.{js,ts,jsx,tsx}",
        "./api/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                fredoka: ['Fredoka', 'sans-serif'],
                quicksand: ['Quicksand', 'sans-serif'],
                mono: ['"Roboto Mono"', 'monospace'],
                sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 20s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                }
            }
        }
    },
    plugins: [],
}
