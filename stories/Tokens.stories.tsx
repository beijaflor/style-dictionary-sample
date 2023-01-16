import React from "react";
import DesignTokens from "../dist/design-tokens.module";
import "./Tokens.css";

type Props = {
  token: import("style-dictionary/types/DesignToken").DesignToken;
};

const ColorToken = ({ token }: Props) => (
  <div className="color-token">
    <div className="tip" style={{ backgroundColor: token.value }} />
    <dl className="token-description">
      <dt className="title">name</dt>
      <dd className="text name">{token.name}</dd>
      <dt className="title">value</dt>
      <dd className="text value">{token.value}</dd>
      <dt className="title">description</dt>
      <dd className="text description">{token.comment}</dd>
    </dl>
  </div>
);

const SpacesToken = ({ token }: Props) => (
  <div className="spaces-token">
    <div className="gap">
      <div className="box" />
      <div className="gap" style={{ width: token.value, height: token.value }} />
      <div className="box" />
    </div>
    <dl className="token-description">
      <dt className="title">name</dt>
      <dd className="text name">{token.name}</dd>
      <dt className="title">value</dt>
      <dd className="text value">{token.value}</dd>
      <dt className="title">description</dt>
      <dd className="text description">{token.comment}</dd>
    </dl>
  </div>
);

export default {
  title: "DesignToken",
  component: { ColorToken, SpacesToken },
};

const ColorTemplate = () =>
  Object.values(DesignTokens)
    .filter((token) => token.attributes?.category === "color")
    .map((token) => <ColorToken token={token} />);

export const Color = ColorTemplate.bind({});
Color.args = {
  primary: true,
  label: "Color",
};

const SpacesTemplate = () =>
  Object.values(DesignTokens)
    .filter((token) => token.attributes?.category === "spaces")
    .map((token) => <SpacesToken token={token} />);

export const Spaces = SpacesTemplate.bind({});
Spaces.args = {
  label: "Spaces",
};
