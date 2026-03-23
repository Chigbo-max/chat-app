const { shadcnPreset } = require("tailwind-config");

module.exports = {
  presets: [shadcnPreset()],
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

