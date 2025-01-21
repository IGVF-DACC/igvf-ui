module.exports = {
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      options: {
        parser: "typescript",
      },
    },
  ],
  trailingComma: "es5",
  plugins: ["prettier-plugin-tailwindcss"],
};
