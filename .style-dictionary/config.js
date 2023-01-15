const StyleDictionary = require("style-dictionary");
const {
  fileHeader,
  getTypeScriptType,
} = require("style-dictionary/lib/common/formatHelpers");
const yaml = require("yaml");

const buildPath = "dist/";

const options = {
  showFileHeader: false,
};

/** コメントを jsdoc 形式で挿入する */
function injectComment(content, comment) {
  const jsdoc = comment ? `/** ${comment} */\n` : "";
  return jsdoc + content + "\n";
}

/**
 * `javascript/es6` を拡張してコメントの挿入を jsdoc 形式に変更したフォーマッタ
 * ref: https://github.com/amzn/style-dictionary/blob/v3.7.1/lib/common/formats.js#L331-L371
 */
StyleDictionary.registerFormat({
  name: "javascript/es6-jsdoc",
  formatter: function ({ dictionary, file }) {
    return (
      fileHeader({ file }) +
      dictionary.allTokens
        .map(function (token) {
          return injectComment(
            `export const ${token.name} = ${JSON.stringify(token.value)};`,
            token.comment
          );
        })
        .join("\n")
    );
  },
});

/**
 * `typescript/es6-declarations` を拡張してコメントの挿入を jsdoc 形式に変更したフォーマッタ
 * ref: https://github.com/amzn/style-dictionary/blob/v3.7.1/lib/common/formats.js#L373-L413
 */
StyleDictionary.registerFormat({
  name: "typescript/es6-declarations-jsdoc",
  formatter: function ({ dictionary, file }) {
    return (
      fileHeader({ file }) +
      dictionary.allProperties
        .map(function (prop) {
          return injectComment(
            `export const ${prop.name}: ${getTypeScriptType(prop.value)};`,
            prop.comment
          );
        })
        .join("\n")
    );
  },
});

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
      buildPath,
      files: [
        {
          destination: "_design-tokens.scss",
          format: "scss/variables",
        },
      ],
      options,
    },
    typescript: {
      transformGroup: "js",
      buildPath,
      files: [
        {
          format: "javascript/es6-jsdoc",
          destination: "design-tokens.js",
        },
        {
          format: "typescript/es6-declarations-jsdoc",
          destination: "design-tokens.d.ts",
        },
      ],
      options,
    },
  },
};
