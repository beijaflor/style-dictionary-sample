const yaml = require("yaml");

module.exports = {
  parsers: [
    {
      pattern: /\.yaml$/,
      parse: ({ contents }) => yaml.parse(contents),
    },
  ],
  source: [".style-dictionary/tokens/**/*.yaml"],
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
