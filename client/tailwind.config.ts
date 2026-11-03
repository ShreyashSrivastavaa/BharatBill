import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        navy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        runway: {
          cream: '#f8f7f5',
          paper: '#ffffff',
          linen: '#e3dfd5',
          stone: '#d5d2cd',
          ash: '#aca89f',
          driftwood: '#8f897e',
          bark: '#61594a',
          espresso: '#261b07',
          amber: '#f9a600',
          gold: '#e89b01',
          terracotta: '#f0624f',
          wisteria: '#d5befa',
          honey: '#f8da9d',
        },
      },
      boxShadow: {
        'runway-sm': '0px 4px 8px 0px rgba(38, 27, 7, 0.06)',
        'runway-cta': 'inset 0px 2px 4px 0px rgba(255, 255, 255, 0.56), 0px 4px 8px 0px rgba(38, 27, 7, 0.06), 0px 1px 2px 0px rgba(38, 27, 7, 0.36)',
      },
      borderRadius: {
        'runway-card': '8px',
        'runway-btn': '8px',
        'runway-badge': '4px',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};

export default config;
