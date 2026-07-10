import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F8EF7',
          hover: '#3B7DE8',
        },
        secondary: {
          DEFAULT: '#7C5CFC',
        },
        surface: {
          DEFAULT: '#161B22',
          raised: '#1C2330',
        },
        border: {
          DEFAULT: '#30363D',
        },
        risk: {
          safe: '#22C55E',
          low: '#84CC16',
          medium: '#F59E0B',
          high: '#EF4444',
          critical: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      backgroundColor: {
        page: '#0D1117',
      },
    },
  },
  plugins: [],
};

export default config;
