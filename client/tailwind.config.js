/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5fbff",
          100: "#e8f6ff",
          200: "#c4e9ff",
          300: "#8fd4ff",
          400: "#4fb9ff",
          500: "#1f98f3",
          600: "#0d79d1",
          700: "#0d60a7",
          800: "#104f86",
          900: "#12436f"
        }
      },
      fontFamily: {
        sans: ["Sora", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 10px 30px rgba(31, 152, 243, 0.25)"
      }
    },
  },
  plugins: [],
};
