export type Text = {
  text: string;
  size: number;
  style: FontStyles;
};

export type Paragraph = Text & {
  bottomPadding: number;
  urlize?: boolean;
};
