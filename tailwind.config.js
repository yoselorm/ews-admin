/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        // Derived from the logo (#2F5977 = brand-600)
        brand: {
          50: '#f3f7fa',
          100: '#e3edf4',
          200: '#c9dbe7',
          300: '#a1c0d4',
          400: '#6f9cba',
          500: '#4a7fa1',
          600: '#2f5977',
          700: '#284c66',
          800: '#243f54',
          900: '#1f3546',
          950: '#14222e',
        },
      },
    },
  },
  plugins: [],
}
