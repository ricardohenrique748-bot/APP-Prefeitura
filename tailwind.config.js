/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#1754cf',
                background: {
                    light: '#ffffff',
                    dark: '#111621'
                },
                card: {
                    dark: '#1c2537'
                },
                accent: {
                    success: '#0bda5e',
                    error: '#fa6238',
                    warning: '#f59e0b'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif']
            }
        }
    },
    plugins: [],
}
