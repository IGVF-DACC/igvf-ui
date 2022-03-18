// const Color = require("color")

// Functions to help with altering colors.
// https://github.com/tailwindlabs/discuss/issues/392#issuecomment-559305633
// const alpha = (clr, val) => Color(clr).alpha(val).rgb().string()
// const lighten = (clr, val) => Color(clr).lighten(val).rgb().string()
// const darken = (clr, val) => Color(clr).darken(val).rgb().string()

module.exports = {
  darkMode: "class",
  content: ["./pages/**/*.js", "./components/**/*.js"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: "var(--color-brand)",
      },
    },
  },
  plugins: [],
}
