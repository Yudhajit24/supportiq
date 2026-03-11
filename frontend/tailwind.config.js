/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                // Forest & Sage palette
                nb: {
                    yellow:   '#ccd5ae',  // → Sage (replaces yellow)
                    charcoal: '#01472e',  // → Forest (replaces charcoal)
                    sage:     '#a3b18a',  // → Moss
                    dark:     '#01472e',  // → Forest
                    cream:    '#fefae0',  // new
                    olive:    '#e9edc9',  // new
                },
            },
            fontFamily: {
                heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                body:    ['"Inter"', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            boxShadow: {
                // Forest-tinted soft shadows
                'nb-sm':  '0 4px 16px 0 rgba(1,71,46,0.12)',
                'nb-md':  '0 8px 24px 0 rgba(1,71,46,0.16)',
                'nb-lg':  '0 12px 40px 0 rgba(1,71,46,0.20)',
                'nb-xl':  '0 20px 60px 0 rgba(1,71,46,0.25)',
                'nb-none':'none',
            },
            keyframes: {
                'fade-in': {
                    '0%':   { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-right': {
                    '0%':   { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'slide-up': {
                    '0%':   { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                shimmer: {
                    '0%':   { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '.5' },
                },
            },
            animation: {
                'fade-in':       'fade-in 0.6s cubic-bezier(0.16,1,0.3,1)',
                'slide-in-right':'slide-in-right 0.4s cubic-bezier(0.16,1,0.3,1)',
                'slide-up':      'slide-up 0.5s cubic-bezier(0.16,1,0.3,1)',
                shimmer:         'shimmer 2s infinite linear',
                pulse:           'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
