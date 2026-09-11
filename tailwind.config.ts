import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#090a10',
          dark: '#0e111a',
          card: '#141824',
          cardHover: '#1c2234',
          cardLight: '#232b40',
          border: '#27314a',
          borderLight: '#384666',
          crimson: '#6366f1', // Electric Indigo Primary
          crimsonDark: '#4f46e5',
          blood: '#4338ca',
          bloodDark: '#312e81',
          neon: '#a855f7', // Vivid Purple/Violet
          gold: '#38bdf8', // Electric Sky/Cyan Accent
          goldDark: '#0284c7',
          emerald: '#10b981',
          cyan: '#06b6d4',
          textMain: '#f8fafc',
          textMuted: '#94a3b8',
          textDark: '#64748b'
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
        display: ['"Chakra Petch"', 'Cairo', 'sans-serif'],
        sans: ['Cairo', 'Tajawal', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'glow-crimson': '0 0 25px rgba(99, 102, 241, 0.45)',
        'glow-crimson-lg': '0 0 45px rgba(99, 102, 241, 0.65), 0 0 15px rgba(168, 85, 247, 0.5)',
        'glow-blood': '0 0 30px rgba(67, 56, 202, 0.5)',
        'glow-gold': '0 0 25px rgba(56, 189, 248, 0.4)',
        'arena-card': '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.15)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite alternate',
        'glow-cycle': 'glowCycle 3s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-8px)' }
        },
        glowCycle: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
