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

const BULLET_MARKER = '•   ';

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
  ...wordTokens(boldPrefix(item.bold, item.text), FontStyles.BOLD),
  ...wordTokens(item.text, FontStyles.NORMAL),
];

class BulletList extends TextComponent {
  private readonly bulletItems: BulletText[];
  private readonly leadingParagraphs: Paragraph[];
  private readonly trailingParagraphs: Paragraph[];
  private readonly numbered: boolean;

  constructor(
    pdf: Pdf,
    {
      initialText,
      bulletText,
      finalText,
      numbered = false,
    }: { initialText?: Paragraph[]; bulletText: BulletText[]; finalText?: Paragraph[]; numbered?: boolean },
  ) {
    super(pdf, [...(initialText ?? []), ...(finalText ?? [])]);

    this.bulletItems = bulletText;
    this.leadingParagraphs = initialText ?? [];
    this.trailingParagraphs = finalText ?? [];
    this.numbered = numbered;
  }

  protected getComponentHeight() {
    const paragraphHeight = [...this.leadingParagraphs, ...this.trailingParagraphs].reduce(
      (height, paragraph) => height + this.pdf.getParagraphHeight(paragraph),
      0,
    );

    return (
      paragraphHeight + this.bulletItems.reduce((height, item, index) => height + this.bulletHeight(item, index), 0)
    );
  }

  protected createComponent() {
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

  private markerFor(index: number) {
    return this.numbered ? `${index + 1}. ` : BULLET_MARKER;
  }

  private markerWidth() {
    const markers = this.numbered ? this.bulletItems.map((_, index) => this.markerFor(index)) : [BULLET_MARKER];
    return Math.max(
      ...markers.map((marker) =>
        this.pdf.getTextWidth({ text: marker, size: MAIN_TEXT_SIZE, style: FontStyles.NORMAL }),
      ),
    );
  }

  private textColumnWidth() {
    return this.pdf.maxPageWidth - this.markerWidth();
  }

  private layoutItem(item: BulletText): StyledToken[][] {
    if (typeof item === 'string') {
      return this.pdf
        .splitParagraph({ text: item, size: MAIN_TEXT_SIZE, style: FontStyles.NORMAL }, this.textColumnWidth())
        .map((line) => [{ text: line, style: FontStyles.NORMAL }]);
    }

    const lines: StyledToken[][] = [];
    let line: StyledToken[] = [];
    let lineWidth = 0;

    tokensForBullet(item).forEach((token) => {
      const width = this.pdf.getTextWidth({ text: token.text, size: MAIN_TEXT_SIZE, style: token.style });
      const isSpace = /^\s+$/.test(token.text);
      if (line.length > 0 && lineWidth + width > this.textColumnWidth()) {
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
    return this.layoutItem(item).length * this.lineHeight() + this.bottomPaddingFor(index);
  }

  private drawBullet(item: BulletText, index: number) {
    const lineHeight = this.lineHeight();
    const textX = MARGIN_WIDTH + this.markerWidth();

    this.layoutItem(item).forEach((line, lineIndex) => {
      this.pdf.currentY += lineHeight;
      if (lineIndex === 0) {
        this.pdf.addText({
          text: this.markerFor(index),
          x: MARGIN_WIDTH,
          y: this.pdf.currentY,
          size: MAIN_TEXT_SIZE,
          style: FontStyles.NORMAL,
        });
      }

      let x = textX;
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

    this.pdf.currentY += this.bottomPaddingFor(index);
  }
}

export default BulletList;
