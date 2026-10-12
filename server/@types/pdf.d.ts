export type Text = {
  text: string;
  size: number;
  style: FontStyles;
};

export type TextRun = {
  text: string;
  style: FontStyles;
  underline?: boolean;
};

export type Paragraph = Text & {
  bottomPadding: number;
  topPadding?: number;
  urlize?: boolean;
  inset?: boolean;
  segments?: TextRun[];
};
