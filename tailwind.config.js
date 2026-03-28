module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3A3D41",
        secondary: "#8B9467",
        accent: "#34C759",
        background: "#1A1D23",
        foreground: "#FFFFFF",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#FFFFFF",
            a: {
              color: "#34C759",
              "&:hover": {
                color: "#2EC157",
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};