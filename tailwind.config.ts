import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#fffdf7',
          100: '#faf5e8',
          200: '#f7f3ec',
          300: '#efe6d0',
          400: '#ede4d1',
          500: '#d9cfb8',
          600: '#c8b892',
        },
        ink: {
          900: '#1a1a1a',
          700: '#52463a',
          600: '#6e5a3e',
          500: '#8a7a58',
          400: '#a8976f',
        },
        wine: {
          DEFAULT: '#6e1f2a',
          dark:    '#561621',
        },
      },
      fontFamily: {
        serif: [
          'var(--font-serif)',
          '"Noto Serif JP"',
          'serif',
        ],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic UI"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
