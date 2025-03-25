import fs from 'fs';

import { Request } from 'express';
import JsPdf from 'jspdf';

import { Paragraph, PdfBuilder } from '../@types/pdf';
import {
  FONT,
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  HEADER_LOGO_HEIGHT,
  LINE_HEIGHT_RATIO,
  MAIN_TEXT_SIZE,
  MARGIN_WIDTH,
  MM_PER_POINT,
  SECTION_HEADING_SIZE,
} from '../constants/pdfConstants';
import getAssetPath from '../utils/getAssetPath';

import FontStyles from './fontStyles';

class Pdf implements PdfBuilder {
  public readonly document: JsPdf;
  public readonly request: Request;

  public currentY = HEADER_HEIGHT;
  public readonly maxPageWidth: number;

  private readonly logoData = `data:image/png;base64,${fs.readFileSync(getAssetPath('images/crest.png'), { encoding: 'base64' })}`;

  constructor(autoPrint: boolean, request: Request) {
    this.request = request;
    // @ts-expect-error There is an error into the jsPDF type declaration.
    this.document = new JsPdf({ lineHeight: LINE_HEIGHT_RATIO });
    this.maxPageWidth = this.document.internal.pageSize.getWidth() - 2 * MARGIN_WIDTH;
    this.setupFonts();
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
    this.document.setFillColor(0, 0, 0).rect(0, 0, this.document.internal.pageSize.getWidth(), HEADER_HEIGHT, 'F');
    const headerLogoWidth = HEADER_LOGO_HEIGHT * 5;
    this.document.addImage(
      this.logoData,
      'PNG',
      MARGIN_WIDTH,
      0.5 * (HEADER_HEIGHT - HEADER_LOGO_HEIGHT),
      headerLogoWidth,
      HEADER_LOGO_HEIGHT,
    );
    this.document
      .setFont(FONT, FontStyles.BOLD)
      .setFontSize(SECTION_HEADING_SIZE)
      .setTextColor(255, 255, 255)
      .text(
        this.request.__('pdf.name'),
        headerLogoWidth +
          MARGIN_WIDTH +
          0.5 * (this.document.internal.pageSize.getWidth() - headerLogoWidth - MARGIN_WIDTH),
        HEADER_HEIGHT * 0.5 + 0.25 * LINE_HEIGHT_RATIO * SECTION_HEADING_SIZE * MM_PER_POINT,
        { align: 'center' },
      )
      .setTextColor(0, 0, 0);
  }

  private addFooterToPage(pageNumber: number) {
    this.document
      .setFont(FONT, FontStyles.NORMAL)
      .setFontSize(MAIN_TEXT_SIZE)
      .text(
        this.request.__('pdf.pageCount', {
          currentPage: pageNumber.toString(),
          totalPages: this.document.getNumberOfPages().toString(),
        }),
        this.document.internal.pageSize.getWidth() - MARGIN_WIDTH,
        this.document.internal.pageSize.getHeight() - MARGIN_WIDTH,
        { align: 'right' },
      );
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

  splitParagraph({ text, size, style }: Paragraph): string[] {
    this.document.setFontSize(size).setFont(FONT, style);
    return this.document.splitTextToSize(text, this.maxPageWidth);
  }

  getParagraphHeight({ text, size, style, bottomPadding }: Paragraph) {
    this.document.setFontSize(size).setFont(FONT, style);
    const textLines = this.splitParagraph({ text, size, style, bottomPadding });
    return size * LINE_HEIGHT_RATIO * textLines.length * MM_PER_POINT + bottomPadding;
  }

  addParagraph({ text, size, style, bottomPadding }: Paragraph) {
    // The first line of text goes above the current y value, so add a single line of spacing to make the paragraph
    // behave the same as all other components we add
    this.currentY += size * LINE_HEIGHT_RATIO * MM_PER_POINT;
    const textLines = this.splitParagraph({ text, size, style, bottomPadding });
    this.document.text(textLines, MARGIN_WIDTH, this.currentY);
    this.currentY += size * LINE_HEIGHT_RATIO * (textLines.length - 1) * MM_PER_POINT + bottomPadding;
  }
}

export default Pdf;
