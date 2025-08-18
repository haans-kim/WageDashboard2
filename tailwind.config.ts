import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      screens: {
        sm: '100%',
        md: '100%',
        lg: '1280px',
        xl: '1440px',
        '2xl': '1600px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49', // 더 진한 색 추가
        },
        // shadcn/ui 호환 색상
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      fontSize: {
        // 미세 조정된 폰트 크기
        'xs': ['0.75rem', { lineHeight: '1.5' }],  // 12px
        'sm': ['0.875rem', { lineHeight: '1.5' }], // 14px
        'base': ['1rem', { lineHeight: '1.6' }],   // 16px
        'lg': ['1.125rem', { lineHeight: '1.6' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.5' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '1.4' }],  // 24px
        '3xl': ['1.875rem', { lineHeight: '1.4' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '1.3' }],  // 36px
      },
    },
  },
  plugins: [],
}
export default config