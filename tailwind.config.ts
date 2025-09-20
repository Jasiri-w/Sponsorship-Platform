import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-league-spartan)', 'Inter', 'system-ui', 'sans-serif'],
        'spartan': ['var(--font-league-spartan)', 'sans-serif'],
        'spartan-light': ['var(--font-league-spartan-light)', 'sans-serif'],
        'spartan-regular': ['var(--font-league-spartan-regular)', 'sans-serif'],
        'spartan-medium': ['var(--font-league-spartan-medium)', 'sans-serif'],
        'spartan-semibold': ['var(--font-league-spartan-semibold)', 'sans-serif'],
        'spartan-bold': ['var(--font-league-spartan-bold)', 'sans-serif'],
        'spartan-extrabold': ['var(--font-league-spartan-extrabold)', 'sans-serif'],
        'spartan-black': ['var(--font-league-spartan-black)', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3', 
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        salmon: {
          50: '#fef7f3',
          100: '#fdede6',
          200: '#fbd8c7',
          300: '#f8bfa0',
          400: '#f59f76',
          500: '#f2845c',
          600: '#e66b47',
          700: '#d55539',
          800: '#b04532',
          900: '#8f3a2e',
        },
        'nsbe-orange': '#B33333',
      },
    },
  },
  plugins: [],
}
export default config