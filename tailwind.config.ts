import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'card-bg': 'var(--card-bg)',
        'card-bg-muted': 'var(--card-bg-muted)',
        'card-bg-olive': 'var(--card-bg-olive)',
        'section-divider': 'var(--section-divider)',
        'nav-bg': 'var(--nav-bg)',
        // Text colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-metadata': 'var(--text-metadata)',
        'text-on-olive': 'var(--text-on-olive)',
        'text-inverse': 'var(--text-inverse)',
        // Border colors
        'border-subtle': 'var(--border-subtle)',
        'border-medium': 'var(--border-medium)',
        'border-strong': 'var(--border-strong)',
        'border-section': 'var(--border-section)',
        // Accent colors
        'accent-primary': 'var(--accent-primary)',
        'accent-hover': 'var(--accent-hover)',
        'accent-dark': 'var(--accent-dark)',
        // Status colors
        'success-bg': 'var(--success-bg)',
        'success-text': 'var(--success-text)',
        'error-bg': 'var(--error-bg)',
        'error-text': 'var(--error-text)',
        'warning-bg': 'var(--warning-bg)',
        'warning-text': 'var(--warning-text)',
        // Legacy support (for gradual migration)
        cream: 'var(--bg-primary)',
        'soft-gray': 'var(--bg-secondary)',
        charcoal: 'var(--text-primary)',
        bronze: 'var(--accent-primary)',
        'charcoal-light': 'var(--text-secondary)',
        'bronze-dark': 'var(--accent-dark)',
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

