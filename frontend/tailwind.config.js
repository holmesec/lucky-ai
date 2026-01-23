/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}", // Just in case components are outside src, though file structure showed them in src/components or root/components? 
        // Wait, list_dir showed components in root/components.
        "./components/**/*.{js,ts,jsx,tsx}",
        "./themes/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}", // For App.tsx if it's in root
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
