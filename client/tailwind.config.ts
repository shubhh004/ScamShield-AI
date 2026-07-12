import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          muted: '#2563eb1a',
        },
        danger: {
          DEFAULT: '#ef4444',
          muted: '#ef44441a',
        },
        success: {
          DEFAULT: '#22c55e',
          muted: '#22c55e1a',
        },
        warning: {
          DEFAULT: '#f59e0b',
          muted: '#f59e0b1a',
        },
        bg: {
          DEFAULT: '#09090b',
          card: '#18181b',
          elevated: '#27272a',
        },
        border: {
          DEFAULT: '#27272a',
          subtle: '#3f3f46',
        },
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        risk: {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#ef4444',
        },
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37,99,235,0.3), transparent)',
      },
      boxShadow: {
        glow: '0 0 30px rgba(37,99,235,0.15)',
        'glow-sm': '0 0 15px rgba(37,99,235,0.1)',
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
