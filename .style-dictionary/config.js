const StyleDictionary = require("style-dictionary");
const {
  fileHeader,
  getTypeScriptType: _getTypeScriptType,
} = require("style-dictionary/lib/common/formatHelpers");
const yaml = require("yaml");

const buildPath = "dist/";

const options = {
  showFileHeader: false,
};

/** プレフィックスをつけた Branded Type 名を取得する */
function getTypeName(type) {
  const chars = type.split("");
  chars[0] = chars[0].toUpperCase();
  return `DesignToken${chars.join("")}`;
}

/** デフォルトの getTypeScriptType をオーバーライドして、 string 型だった場合は Branded Type を返す */
function getTypeScriptType(value, type) {
  const rawType = _getTypeScriptType(value);
  return rawType === "string" && typeof type !== "undefined"
    ? getTypeName(type)
    : rawType;
}

/** 型定義の先頭に挿入する型定義を生成する */
function generateTypeDefinition(types) {
  let typeDef = [];
  typeDef.push(`type Branded<T, U extends string> = T & { [key in U]: never }`);
  typeDef.push(
    `type TokenType = ${types.map((token) => `'${token}'`).join(" | ")}`
  );
  typeDef.push(
    `type DesignToken<T extends string> = T extends TokenType ? Branded<string, T | 'designToken'> : never`
  );
  typeDef = typeDef.concat(
    types.map(
      (token) => `export type ${getTypeName(token)} = DesignToken<'${token}'>`
    )
  );
  return typeDef.join("\n") + "\n\n";
}

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
 * `typescript/es6-declarations` に以下の拡張を加えたフォーマッタ
 * - コメントの挿入を jsdoc 形式に変更
 * - トークンに指定される型を BrandedType に変更
 * ref: https://github.com/amzn/style-dictionary/blob/v3.7.1/lib/common/formats.js#L373-L413
 */
StyleDictionary.registerFormat({
  name: "typescript/es6-declarations-jsdoc-with-branded-type",
  formatter: function ({ dictionary, file }) {
    const types = new Set();
    const tokens = dictionary.allProperties.map(function (prop) {
      const category = prop.original.attributes?.category;
      if (typeof category !== "undefined") {
        types.add(category);
      }
      return injectComment(
        `export const ${prop.name}: ${getTypeScriptType(
          prop.value,
          category
        )};`,
        prop.comment
      );
    });
    return (
      fileHeader({ file }) +
      generateTypeDefinition(Array.from(types)) +
      tokens.join("\n")
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
          format: "typescript/es6-declarations-jsdoc-with-branded-type",
          destination: "design-tokens.d.ts",
        },
        {
          format: "javascript/module",
          destination: "design-tokens.module.js",
        },
        {
          format: "typescript/module-declarations",
          destination: "design-tokens.module.d.ts",
        },
      ],
      options,
    },
  },
};
