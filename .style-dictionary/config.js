module.exports = {
  source: [".style-dictionary/tokens/**/*.json"],
  platforms: {
    scss: {
      transformGroup: "scss",
      buildPath: "dist/",
      files: [
        {
          destination: "_design-tokens.scss",
          format: "scss/variables",
        },
      ],
      options: {
        showFileHeader: false,
      },
    },
  },
};
