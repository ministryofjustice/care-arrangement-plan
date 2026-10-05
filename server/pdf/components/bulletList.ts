import { Paragraph } from '../../@types/pdf';
import {
  LINE_HEIGHT_RATIO,
  MAIN_TEXT_SIZE,
  MARGIN_WIDTH,
  MM_PER_POINT,
  PARAGRAPH_SPACE,
} from '../../constants/pdfConstants';
import FontStyles from '../fontStyles';
import Pdf from '../pdf';

import TextComponent from './text';

export type BulletText = string | { bold: string; text: string };

type StyledToken = {
  text: string;
  style: FontStyles;
};

const wordTokens = (text: string, style: FontStyles): StyledToken[] =>
  text
    .split(/(\s+)/)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, style }));

const boldPrefix = (bold: string, text: string) => {
  if (bold.length === 0 || text.length === 0 || /\s$/.test(bold) || /^\s/.test(text)) return bold;
  return `${bold} `;
};

const tokensForBullet = (item: { bold: string; text: string }): StyledToken[] => [
  { text: '•   ', style: FontStyles.NORMAL },
  ...wordTokens(boldPrefix(item.bold, item.text), FontStyles.BOLD),
  ...wordTokens(item.text, FontStyles.NORMAL),
];

class BulletList extends TextComponent {
  private readonly bulletItems: BulletText[];
  private readonly leadingParagraphs: Paragraph[];
  private readonly trailingParagraphs: Paragraph[];
  private readonly plainBullets: boolean;

  constructor(
    pdf: Pdf,
    {
      initialText,
      bulletText,
      finalText,
    }: { initialText?: Paragraph[]; bulletText: BulletText[]; finalText?: Paragraph[] },
  ) {
    const plainBullets = bulletText.every((item): item is string => typeof item === 'string');
    const paragraphs: Paragraph[] = initialText ? [...initialText] : [];

    if (plainBullets) {
      paragraphs.push({
        text: bulletText.map((text) => `•   ${text}`).join('\n'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      });
    }

    if (finalText) paragraphs.push(...finalText);
    super(pdf, paragraphs);

    this.bulletItems = bulletText;
    this.leadingParagraphs = initialText ?? [];
    this.trailingParagraphs = finalText ?? [];
    this.plainBullets = plainBullets;
  }

  protected getComponentHeight() {
    if (this.plainBullets) return super.getComponentHeight();

    const paragraphHeight = [...this.leadingParagraphs, ...this.trailingParagraphs].reduce(
      (height, paragraph) => height + this.pdf.getParagraphHeight(paragraph),
      0,
    );

    return (
      paragraphHeight + this.bulletItems.reduce((height, item, index) => height + this.bulletHeight(item, index), 0)
    );
  }

  protected createComponent() {
    if (this.plainBullets) {
      super.createComponent();
      return;
    }

    this.leadingParagraphs.forEach((paragraph) => this.pdf.addParagraph(paragraph));
    this.bulletItems.forEach((item, index) => this.drawBullet(item, index));
    this.trailingParagraphs.forEach((paragraph) => this.pdf.addParagraph(paragraph));
  }

  private bottomPaddingFor(index: number) {
    return index === this.bulletItems.length - 1 ? PARAGRAPH_SPACE : 0;
  }

  private lineHeight() {
    return MAIN_TEXT_SIZE * LINE_HEIGHT_RATIO * MM_PER_POINT;
  }

  private layoutMixedBullet(item: { bold: string; text: string }) {
    const lines: StyledToken[][] = [];
    let line: StyledToken[] = [];
    let lineWidth = 0;

    tokensForBullet(item).forEach((token) => {
      const width = this.pdf.getTextWidth({ text: token.text, size: MAIN_TEXT_SIZE, style: token.style });
      const isSpace = /^\s+$/.test(token.text);
      if (line.length > 0 && lineWidth + width > this.pdf.maxPageWidth) {
        lines.push(line);
        line = [];
        lineWidth = 0;
        if (isSpace) return;
      }
      line.push(token);
      lineWidth += width;
    });

    if (line.length > 0) lines.push(line);
    return lines;
  }

  private bulletHeight(item: BulletText, index: number) {
    const bottomPadding = this.bottomPaddingFor(index);
    if (typeof item === 'string') {
      return this.pdf.getParagraphHeight({
        text: `•   ${item}`,
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding,
      });
    }

    return this.layoutMixedBullet(item).length * this.lineHeight() + bottomPadding;
  }

  private drawBullet(item: BulletText, index: number) {
    const bottomPadding = this.bottomPaddingFor(index);
    if (typeof item === 'string') {
      this.pdf.addParagraph({
        text: `•   ${item}`,
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding,
      });
      return;
    }

    const lineHeight = this.lineHeight();
    this.layoutMixedBullet(item).forEach((line) => {
      this.pdf.currentY += lineHeight;
      let x = MARGIN_WIDTH;
      line.forEach((token) => {
        this.pdf.addText({
          text: token.text,
          x,
          y: this.pdf.currentY,
          size: MAIN_TEXT_SIZE,
          style: token.style,
        });
        x += this.pdf.getTextWidth({ text: token.text, size: MAIN_TEXT_SIZE, style: token.style });
      });
    });
    this.pdf.currentY += bottomPadding;
  }
}

export default BulletList;
