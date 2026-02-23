import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0F',
        'bg-secondary': '#FAFAFA',
        'bg-card': '#FFFFFF',
        'bg-card-dark': '#141420',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'text-on-dark': '#E5E7EB',
        'accent-red': '#EF4444',
        'accent-purple': '#8B5CF6',
        'accent-blue': '#3B82F6',
        'accent-green': '#22C55E',
        'accent-cyan': '#06B6D4',
        'accent-amber': '#F59E0B',
        'accent-pink': '#EC4899',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Noto Sans SC', '-apple-system', 'PingFang SC', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        geo: '0 8px 32px rgba(0,0,0,0.06)',
        'geo-lg': '0 16px 64px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        card: '12px',
      },
      gridTemplateColumns: {
        '7': 'repeat(7, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};

export default config;
