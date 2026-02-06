import fs from 'fs';

import { Request } from 'express';
import { jsPDF } from 'jspdf';

import {Paragraph, Text} from '../@types/pdf';
import {
  FONT,
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  LINE_HEIGHT_RATIO,
  MAIN_TEXT_SIZE,
  MARGIN_WIDTH,
  MM_PER_POINT,
  SECTION_HEADING_SIZE,
} from '../constants/pdfConstants';
import logger from '../logging/logger';
import getAssetPath from '../utils/getAssetPath';

import FontStyles from './fontStyles';

class Pdf {
  public readonly document: jsPDF;
  public readonly request: Request;
  public readonly maxPageWidth: number;

  public currentY = HEADER_HEIGHT;

  private readonly logoData = `data:image/png;base64,${fs.readFileSync(getAssetPath('images/crest.png'), { encoding: 'base64' })}`;

  constructor(autoPrint: boolean, request: Request) {
    this.request = request;
    // @ts-expect-error There is an error into the jsPDF type declaration.
    this.document = new jsPDF({ lineHeight: LINE_HEIGHT_RATIO });
    this.document.allowFsRead = [getAssetPath("fonts/") + "*"];
    this.maxPageWidth = this.document.internal.pageSize.getWidth() - 2 * MARGIN_WIDTH;
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
    this.document.setFillColor(29, 112, 184).rect(0, 0, this.document.internal.pageSize.getWidth(), HEADER_HEIGHT, 'F');
    const logoHeight = 8;
    const logoWidth = logoHeight * 5;
    this.document.addImage(
      this.logoData,
      'PNG',
      MARGIN_WIDTH,
      0.5 * (HEADER_HEIGHT - logoHeight),
      logoWidth,
      logoHeight,
    );
    this.document
      .setFont(FONT, FontStyles.BOLD)
      .setFontSize(SECTION_HEADING_SIZE)
      .setTextColor(255, 255, 255)
      .text(
        this.request.__('pdf.name'),
        logoWidth +
          MARGIN_WIDTH +
          0.5 * (this.document.internal.pageSize.getWidth() - logoWidth - MARGIN_WIDTH),
        HEADER_HEIGHT * 0.5 + 0.25 * LINE_HEIGHT_RATIO * SECTION_HEADING_SIZE * MM_PER_POINT,
        { align: 'center' },
      )
      .setTextColor(0, 0, 0);
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

    // Draw centered, bold extra text if present
    if (extraFooterText) {
      this.document.setFont(FONT, FontStyles.BOLD).setFontSize(MAIN_TEXT_SIZE).text(extraFooterText, pageWidth / 2, footerY, { align: 'center' });
    }

    // Draw right-aligned page count on the same baseline (normal weight)
    this.document
      .setFont(FONT, FontStyles.NORMAL)
      .setFontSize(MAIN_TEXT_SIZE)
      .text(pageCountText, pageWidth - MARGIN_WIDTH, footerY, { align: 'right' });
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

  splitParagraph({ text, size, style }: Text): string[] {
    this.document.setFontSize(size).setFont(FONT, style);
    return this.document.splitTextToSize(text, this.maxPageWidth);
  }

  getParagraphHeight({ text, size, style, bottomPadding }: Paragraph) {
    this.document.setFontSize(size).setFont(FONT, style);
    const textLines = this.splitParagraph({ text, size, style });
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
  ) {
    this.document.setFontSize(size).setFont(FONT, style);

    let startedUrl: string;

    text.forEach((line) => {
      this.currentY += size * LINE_HEIGHT_RATIO * MM_PER_POINT;
      let currentX = MARGIN_WIDTH;

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

  addParagraph({ text, size, style, bottomPadding, urlize }: Paragraph) {
    // The first line of text goes above the current y value, so add a single line of spacing to make the paragraph
    // behave the same as all other components we add
    const textLines = this.splitParagraph({ text, size, style });
    if (urlize) {
      const urls = (text.match(/https?:\/\/\S+/g) || []).map((url) => url.replace(/^[(|<|&lt;]+|[.|,|)|\n|&gt;]+$/g, ''));
      this.addUrlizedParagraph({ text: textLines, size, style }, urls);

      if (urls.length !== 0) {
        logger.error('URL was not linked in PDF. URL missed: ' + urls);
      }
    } else {
      this.currentY += size * LINE_HEIGHT_RATIO * MM_PER_POINT;
      this.addText({ text: textLines, x: MARGIN_WIDTH, y: this.currentY, size, style });
      this.currentY += size * LINE_HEIGHT_RATIO * (textLines.length - 1) * MM_PER_POINT;
    }

    this.currentY += bottomPadding;
  }
}

export default Pdf;
