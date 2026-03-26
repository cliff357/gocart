import { getTailwindColors } from './lib/config/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 使用統一的配色配置
        // 可以透過修改 lib/config/colors.js 來更換整個網站的配色
        ...getTailwindColors(),
        
        // 為了向後兼容，保留原有的 Tailwind 顏色名稱映射
        // 這樣可以逐步遷移代碼，而不會立即破壞現有的樣式
        
        // green -> primary (主要品牌色)
        green: {
          50: getTailwindColors().primary[50],
          100: getTailwindColors().primary[100],
          200: getTailwindColors().primary[200],
          300: getTailwindColors().primary[300],
          400: getTailwindColors().primary[400],
          500: getTailwindColors().primary[500],
          600: getTailwindColors().primary[600],
          700: getTailwindColors().primary[700],
          800: getTailwindColors().primary[800],
          900: getTailwindColors().primary[900],
        },
        
        // slate -> neutral (中性色)
        slate: {
          50: getTailwindColors().neutral[50],
          100: getTailwindColors().neutral[100],
          200: getTailwindColors().neutral[200],
          300: getTailwindColors().neutral[300],
          400: getTailwindColors().neutral[400],
          500: getTailwindColors().neutral[500],
          600: getTailwindColors().neutral[600],
          700: getTailwindColors().neutral[700],
          800: getTailwindColors().neutral[800],
          900: getTailwindColors().neutral[900],
        },
        
        // gray (灰色系統)
        gray: {
          300: '#d1d5db',
          500: '#6b7280',
          800: '#1f2937',
          900: '#111827',
        },
        
        // blue (次要色)
        blue: {
          200: getTailwindColors().secondary[200],
        },
        
        // yellow (警告色)
        yellow: {
          100: getTailwindColors().warning.light,
          500: getTailwindColors().warning.DEFAULT,
        },
        
        // red (錯誤色)
        red: {
          500: getTailwindColors().error.DEFAULT,
          700: getTailwindColors().error.dark,
        },
      },
      
      // 其他擴展配置
      spacing: {
        '18': '4.5rem',
        '26': '6.5rem',
        '100': '25rem',
        '113': '28.25rem',
      },
      
      maxWidth: {
        'xs': '20rem',
      },
      
      scale: {
        '103': '1.03',
      },
      
      keyframes: {
        marqueeScroll: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      
      animation: {
        'marquee': 'marqueeScroll 30s linear infinite',
      },
    },
  },
  plugins: [],
}
