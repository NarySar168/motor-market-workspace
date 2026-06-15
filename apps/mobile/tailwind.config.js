/** @type {import('tailwindcss').Config} */
module.exports = {
  // We point Metro to your local app AND your shared monorepo package
  content: [
    "./App.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  // This preset is the magic that translates Tailwind into React Native styles
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}