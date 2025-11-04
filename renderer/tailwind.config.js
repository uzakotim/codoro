const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      // use colors only specified
      white: colors.white,
      gray: colors.gray,
      blue: colors.blue,
      orange: colors.orange,
      red: colors.red,
      green: colors.green,
      yellow: colors.yellow,
      black: colors.black,
      transparent: colors.transparent,
      current: colors.currentColor,

      // use colors from tailwindcss
      ...colors,
    },
    extend: {},
  },
  plugins: [],
}
