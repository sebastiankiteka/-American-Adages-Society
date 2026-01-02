import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F1E8',
        'soft-gray': '#E8E5DF',
        charcoal: '#2C2C2C',
        bronze: '#8B7355',
        'charcoal-light': '#4A4A4A',
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'Open Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

