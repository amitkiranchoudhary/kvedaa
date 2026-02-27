/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                forest: {
                    darkest: '#050d05',
                    dark: '#0a170a',
                    deep: '#0f210f',
                    panel: '#132a13',
                    card: '#1a3a1a',
                    border: '#254025',
                    accent: '#4ade80',
                    gold: '#e6b422',
                    amber: '#c9960c',
                    moss: '#5a7d2b',
                    sage: '#7ba35c',
                    bark: '#5c4033',
                    earth: '#3b2f2f',
                    mist: '#b8d8b8',
                    text: '#e8f5e8',
                    muted: '#7aaf7a',
                    cream: '#faf5eb',
                    canopy: '#1b4332',
                    leaf: '#2d6a4f',
                    fern: '#40916c',
                    spring: '#52b788',
                    glow: '#95d5b2',
                },
                kv: {
                    green: '#2d5a27',
                    lime: '#7cb342',
                    leaf: '#8bc34a',
                    yellow: '#ffc107',
                    amber: '#ff9800',
                    orange: '#f57c00',
                    sunset: '#e65100',
                    warm: '#ff6d00',
                },
                scada: {
                    dark: '#050d05',
                    panel: '#132a13',
                    card: '#1a3a1a',
                    border: '#254025',
                    accent: '#4ade80',
                    green: '#22c55e',
                    red: '#ef4444',
                    yellow: '#e6b422',
                    text: '#e8f5e8',
                    muted: '#7aaf7a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Playfair Display', 'Georgia', 'serif'],
            },
            keyframes: {
                firefly: {
                    '0%, 100%': { opacity: '0', transform: 'translateY(0) scale(0.5)' },
                    '50%': { opacity: '1', transform: 'translateY(-20px) scale(1)' },
                },
                sway: {
                    '0%, 100%': { transform: 'rotate(-1.5deg)' },
                    '50%': { transform: 'rotate(1.5deg)' },
                },
                drift: {
                    '0%': { transform: 'translateY(0) translateX(0)' },
                    '33%': { transform: 'translateY(-10px) translateX(5px)' },
                    '66%': { transform: 'translateY(-4px) translateX(-4px)' },
                    '100%': { transform: 'translateY(0) translateX(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                gentleFloat: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '25%': { transform: 'translateY(-5px) rotate(1deg)' },
                    '50%': { transform: 'translateY(-8px) rotate(0deg)' },
                    '75%': { transform: 'translateY(-3px) rotate(-1deg)' },
                },
                sunray: {
                    '0%, 100%': { opacity: '0.15', transform: 'scaleY(1)' },
                    '50%': { opacity: '0.25', transform: 'scaleY(1.05)' },
                },
                leafDrop: {
                    '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
                    '10%': { opacity: '0.7' },
                    '90%': { opacity: '0.5' },
                    '100%': { transform: 'translateY(100vh) rotate(540deg)', opacity: '0' },
                },
            },
            animation: {
                firefly: 'firefly 4s ease-in-out infinite',
                sway: 'sway 6s ease-in-out infinite',
                drift: 'drift 8s ease-in-out infinite',
                shimmer: 'shimmer 3s linear infinite',
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'scale-in': 'scaleIn 0.4s ease-out forwards',
                'gentle-float': 'gentleFloat 7s ease-in-out infinite',
                sunray: 'sunray 8s ease-in-out infinite',
                'leaf-drop': 'leafDrop 15s linear infinite',
            },
            backgroundImage: {
                'forest-gradient': 'linear-gradient(180deg, #050d05 0%, #0a170a 25%, #0f210f 50%, #132a13 75%, #050d05 100%)',
                'canopy-light': 'radial-gradient(ellipse at 50% 0%, rgba(74, 222, 128, 0.1), transparent 65%)',
                'sunbeam': 'linear-gradient(135deg, rgba(230, 180, 34, 0.06), transparent 40%)',
                'moss-gradient': 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)',
            },
            boxShadow: {
                'forest': '0 4px 30px rgba(74, 222, 128, 0.08), 0 1px 3px rgba(0, 0, 0, 0.3)',
                'forest-lg': '0 8px 40px rgba(74, 222, 128, 0.12), 0 2px 6px rgba(0, 0, 0, 0.4)',
                'glow-green': '0 0 20px rgba(74, 222, 128, 0.15), 0 0 60px rgba(74, 222, 128, 0.05)',
                'glow-gold': '0 0 20px rgba(230, 180, 34, 0.15), 0 0 60px rgba(230, 180, 34, 0.05)',
                'glow-orange': '0 0 20px rgba(245, 124, 0, 0.15), 0 0 60px rgba(245, 124, 0, 0.05)',
                'inner-forest': 'inset 0 1px 0 rgba(74, 222, 128, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
            },
        },
    },
    plugins: [
        require("tailwindcss-animate")
    ],
}
