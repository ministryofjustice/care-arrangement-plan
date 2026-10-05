import fs from 'fs';

import { Request } from 'express';
import { jsPDF } from 'jspdf';

import { version as packageVersion } from '../../package.json';
import { Paragraph, Text } from '../@types/pdf';
import {
  FONT,
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  INSET_BAR_WIDTH,
  INSET_TEXT_GAP,
  LINE_HEIGHT_RATIO,
  MARGIN_WIDTH,
  MM_PER_POINT,
  SECTION_HEADING_SIZE,
} from '../constants/pdfConstants';
import logger from '../logging/logger';
import getAssetPath from '../utils/getAssetPath';

import FontStyles from './fontStyles';

type SupportToken = {
  text: string;
  style: FontStyles;
  underline?: boolean;
  email?: string;
};

class Pdf {
  public readonly document: jsPDF;
  public readonly request: Request;
  private contentWidth: number;

  public currentY = HEADER_HEIGHT;

  public get maxPageWidth() {
    return this.contentWidth;
  }

  constructor(autoPrint: boolean, request: Request) {
    this.request = request;
    // @ts-expect-error There is an error into the jsPDF type declaration.
    this.document = new jsPDF({ lineHeight: LINE_HEIGHT_RATIO });
    this.document.allowFsRead = [getAssetPath('fonts/') + '*'];
    this.contentWidth = this.document.internal.pageSize.getWidth() - 2 * MARGIN_WIDTH;
    this.setupFonts();
    // Set document title for proper filename when printing/downloading
    this.document.setProperties({
      title: request.__('pdf.name'),
    });
    if (autoPrint) this.document.autoPrint();
    this.addHeaderToPage();
  }

  public toArrayBuffer() {
    return this.document.output('arraybuffer');
  }

  public addFooterToEveryPage() {
    for (let pageNumber = 1; pageNumber <= this.document.getNumberOfPages(); pageNumber++) {
      this.document.setPage(pageNumber);
      this.addFooterToPage(pageNumber);
    }
  }

  private setupFonts() {
    this.document.addFileToVFS(
      'bold-b542beb274-v2.ttf',
      fs.readFileSync(getAssetPath('fonts/bold-b542beb274-v2.ttf')).toString('base64'),
    );
    this.document.addFont('bold-b542beb274-v2.ttf', FONT, FontStyles.BOLD);
    this.document.addFileToVFS(
      'light-94a07e06a1-v2.ttf',
      fs.readFileSync(getAssetPath('fonts/light-94a07e06a1-v2.ttf')).toString('base64'),
    );
    this.document.addFont('light-94a07e06a1-v2.ttf', FONT, FontStyles.NORMAL);
  }

  private addHeaderToPage() {
    this.document
      .setFont(FONT, FontStyles.BOLD)
      .setFontSize(SECTION_HEADING_SIZE)
      .text(
        this.request.__('pdf.name'),
        MARGIN_WIDTH,
        HEADER_HEIGHT * 0.5 + 0.25 * LINE_HEIGHT_RATIO * SECTION_HEADING_SIZE * MM_PER_POINT,
        { align: 'left' },
      );
  }

  private addFooterToPage(pageNumber: number) {
    const pageCountText = this.request.__('pdf.pageCount', {
      currentPage: pageNumber.toString(),
      totalPages: this.document.getNumberOfPages().toString(),
    });

    const extraFooterText = this.request.__('pdf.everyPageReminder') || '';

    const pageWidth = this.document.internal.pageSize.getWidth();
    const pageHeight = this.document.internal.pageSize.getHeight();
    const footerY = pageHeight - MARGIN_WIDTH;

    // Draw left-aligned version and timestamp
    const now = new Date();
    const datePart = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const timePart = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    this.document
      .setFont(FONT, FontStyles.NORMAL)
      .setFontSize(10)
      .text(`v${packageVersion} · ${datePart} ${timePart}`, MARGIN_WIDTH, footerY, { align: 'left' });

    // Draw centered, bold extra text if present
    if (extraFooterText) {
      this.document
        .setFont(FONT, FontStyles.BOLD)
        .setFontSize(10)
        .text(extraFooterText, pageWidth / 2, footerY, { align: 'center' });
    }

    // Draw right-aligned page count on the same baseline (normal weight)
    this.document
      .setFont(FONT, FontStyles.NORMAL)
      .setFontSize(10)
      .text(pageCountText, pageWidth - MARGIN_WIDTH, footerY, { align: 'right' });
  }

  public restoreContentWidth() {
    this.contentWidth = this.document.internal.pageSize.getWidth() - 2 * MARGIN_WIDTH;
  }

  public addSupportBox(contact: string, unableToAssist: string) {
    const boxWidth = 58;
    const boxGap = 6;
    const padding = 3.5;
    const paragraphGap = 3;
    const size = 10;
    const lineHeight = size * LINE_HEIGHT_RATIO * MM_PER_POINT;
    const innerWidth = boxWidth - padding * 2;
    const fullWidth = this.document.internal.pageSize.getWidth() - 2 * MARGIN_WIDTH;
    const boxX = MARGIN_WIDTH + fullWidth - boxWidth;
    const boxTop = this.currentY;

    const contactLines = this.layoutSupportLines(this.supportTokens(contact), innerWidth, size);
    const unableLines = this.layoutSupportLines(
      this.wordsAsTokens(unableToAssist, FontStyles.NORMAL),
      innerWidth,
      size,
    );
    const boxHeight =
      padding + contactLines.length * lineHeight + paragraphGap + unableLines.length * lineHeight + padding;

    this.document.setFillColor(227, 227, 227);
    this.document.rect(boxX, boxTop, boxWidth, boxHeight, 'F');
    this.document.setFillColor(0, 0, 0);

    let textY = boxTop + padding;
    textY = this.drawCenteredSupportLines(contactLines, boxX, boxWidth, textY, size);
    this.drawCenteredSupportLines(unableLines, boxX, boxWidth, textY + paragraphGap, size);

    this.contentWidth = fullWidth - boxWidth - boxGap;
    return boxTop + boxHeight;
  }

  heightWillOverflowDocument(height: number) {
    return height + this.currentY > this.document.internal.pageSize.getHeight() - FOOTER_HEIGHT;
  }

  createNewPage() {
    this.document.addPage();
    this.currentY = HEADER_HEIGHT;
    this.addHeaderToPage();
  }

  drawBorder(x: number, y: number, xSize: number, ySize: number) {
    this.document.setDrawColor('black');
    this.document.setLineWidth(0.5);
    this.document.rect(x - 0.3, y - 0.3, xSize + 0.6, ySize + 0.6);
  }

  splitParagraph({ text, size, style }: Text, width = this.maxPageWidth): string[] {
    this.document.setFontSize(size).setFont(FONT, style);
    return this.document.splitTextToSize(text, width);
  }

  getParagraphHeight({ text, size, style, bottomPadding, inset }: Paragraph) {
    this.document.setFontSize(size).setFont(FONT, style);
    const textLines = this.splitParagraph({ text, size, style }, this.paragraphWidth(inset));
    return size * LINE_HEIGHT_RATIO * textLines.length * MM_PER_POINT + bottomPadding;
  }

  getTextWidth({ text, size, style }: Text) {
    this.document.setFontSize(size).setFont(FONT, style);
    return this.document.getTextWidth(text);
  }

  addText({
    text,
    x,
    y,
    size,
    style,
  }: {
    text: string | string[];
    x: number;
    y: number;
    size: number;
    style: FontStyles;
  }) {
    this.document.setFontSize(size).setFont(FONT, style).text(text, x, y);
  }

  private wordsAsTokens(text: string, style: FontStyles): SupportToken[] {
    return text
      .split(/(\s+)/)
      .filter((part) => part.length > 0)
      .map((part) => ({ text: part, style }));
  }

  private supportTokens(text: string): SupportToken[] {
    const match = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    if (!match || match.index === undefined) return this.wordsAsTokens(text, FontStyles.NORMAL);

    const email = match[0];
    const at = email.indexOf('@');
    return [
      ...this.wordsAsTokens(text.slice(0, match.index), FontStyles.NORMAL),
      { text: email.slice(0, at + 1), style: FontStyles.BOLD, underline: true, email },
      { text: email.slice(at + 1), style: FontStyles.BOLD, underline: true, email },
      ...this.wordsAsTokens(text.slice(match.index + email.length), FontStyles.NORMAL),
    ];
  }

  private layoutSupportLines(tokens: SupportToken[], maxWidth: number, size: number) {
    const lines: SupportToken[][] = [];
    let line: SupportToken[] = [];
    let lineWidth = 0;

    tokens.forEach((token) => {
      const width = this.getTextWidth({ text: token.text, size, style: token.style });
      const isSpace = /^\s+$/.test(token.text);
      if (line.length > 0 && lineWidth + width > maxWidth) {
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

  private drawCenteredSupportLines(lines: SupportToken[][], boxX: number, boxWidth: number, top: number, size: number) {
    const lineHeight = size * LINE_HEIGHT_RATIO * MM_PER_POINT;
    let y = top;

    lines.forEach((line) => {
      y += lineHeight;
      const widths = line.map((token) => this.getTextWidth({ text: token.text, size, style: token.style }));
      const lineWidth = widths.reduce((sum, width) => sum + width, 0);
      let x = boxX + (boxWidth - lineWidth) / 2;

      line.forEach((token, index) => {
        this.document.setFont(FONT, token.style).setFontSize(size);
        if (token.underline && token.email) {
          this.document.textWithLink(token.text, x, y, { url: `mailto:${token.email}` });
          this.document.setDrawColor(0, 0, 0);
          this.document.setLineWidth(0.2);
          this.document.line(x, y + 0.5, x + widths[index], y + 0.5);
        } else {
          this.document.text(token.text, x, y);
        }
        x += widths[index];
      });
    });

    return y;
  }

  private paragraphWidth(inset?: boolean) {
    return inset ? this.maxPageWidth - INSET_BAR_WIDTH - INSET_TEXT_GAP : this.maxPageWidth;
  }

  private drawInsetBar(top: number, size: number, lineCount: number) {
    const lineHeight = size * LINE_HEIGHT_RATIO * MM_PER_POINT;
    const fontHeight = size * MM_PER_POINT;
    const firstBaseline = top + lineHeight;
    const lastBaseline = top + lineCount * lineHeight;
    const barTop = firstBaseline - fontHeight * 0.9;
    const barBottom = lastBaseline + fontHeight * 0.25;

    this.document.setFillColor(178, 180, 182);
    this.document.rect(MARGIN_WIDTH, barTop, INSET_BAR_WIDTH, barBottom - barTop, 'F');
    this.document.setFillColor(0, 0, 0);
  }

  private addUrlizedParagraph(
    {
      text,
      size,
      style,
    }: {
      text: string[];
      size: number;
      style: FontStyles;
    },
    urls: string[],
    left = MARGIN_WIDTH,
  ) {
    this.document.setFontSize(size).setFont(FONT, style);

    let startedUrl: string;

    text.forEach((line) => {
      this.currentY += size * LINE_HEIGHT_RATIO * MM_PER_POINT;
      let currentX = left;

      line
        .trim()
        .split(/(\s+)/)
        .forEach((word) => {
          const nextUrl = urls[0];

          const matches = RegExp(/^(\(|<|&lt;)?(.*?)(\.|,|\)|\n|&gt;)?$/).exec(word);

          const leadingPunctuation = matches[1] || '';
          const wordWithoutPunctuation = matches[2];
          const trailingPunctuation = matches[3] || '';

          if (leadingPunctuation) {
            this.document.text(leadingPunctuation, currentX, this.currentY);
            currentX += this.getTextWidth({ text: leadingPunctuation, size, style });
          }

          if (nextUrl?.startsWith(wordWithoutPunctuation) || startedUrl?.endsWith(wordWithoutPunctuation)) {
            startedUrl = nextUrl;
            this.document.textWithLink(wordWithoutPunctuation, currentX, this.currentY, { url: nextUrl });
          } else {
            this.document.text(wordWithoutPunctuation, currentX, this.currentY);
          }
          currentX += this.getTextWidth({ text: wordWithoutPunctuation, size, style });

          if (startedUrl?.endsWith(wordWithoutPunctuation)) {
            startedUrl = undefined;
            urls.shift();
          }

          if (trailingPunctuation) {
            this.document.text(trailingPunctuation, currentX, this.currentY);
            currentX += this.getTextWidth({ text: trailingPunctuation, size, style });
          }
        });
    });
  }

  addParagraph({ text, size, style, bottomPadding, urlize, inset }: Paragraph) {
    // The first line of text goes above the current y value, so add a single line of spacing to make the paragraph
    // behave the same as all other components we add
    const textLines = this.splitParagraph({ text, size, style }, this.paragraphWidth(inset));
    const blockTop = this.currentY;
    const left = inset ? MARGIN_WIDTH + INSET_BAR_WIDTH + INSET_TEXT_GAP : MARGIN_WIDTH;

    if (inset) this.drawInsetBar(blockTop, size, textLines.length);

    if (urlize) {
      const urls = (text.match(/https?:\/\/\S+/g) || []).map((url) =>
        url.replace(/^[(|<|&lt;]+|[.|,|)|\n|&gt;]+$/g, ''),
      );
      this.addUrlizedParagraph({ text: textLines, size, style }, urls, left);

      if (urls.length !== 0) {
        logger.error('URL was not linked in PDF. URL missed: ' + urls);
      }
    } else {
      this.currentY += size * LINE_HEIGHT_RATIO * MM_PER_POINT;
      this.addText({ text: textLines, x: left, y: this.currentY, size, style });
      this.currentY += size * LINE_HEIGHT_RATIO * (textLines.length - 1) * MM_PER_POINT;
    }

    this.currentY += bottomPadding;
  }
}

export default Pdf;
