/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                scada: {
                    dark: '#0f172a',
                    panel: '#1e293b',
                    card: '#334155',
                    border: '#475569',
                    accent: '#3b82f6',
                    green: '#22c55e',
                    red: '#ef4444',
                    yellow: '#eab308',
                    text: '#f1f5f9',
                    muted: '#94a3b8',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [
        require("tailwindcss-animate")
    ],
}
