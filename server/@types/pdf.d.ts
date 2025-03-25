import { Request } from 'express';
import JsPdf from 'jspdf';

export type Paragraph = {
  text: string;
  size: number;
  style: FontStyles;
  bottomPadding: number;
};

export interface PdfBuilder {
  document: JsPdf;
  request: Request;
  currentY: number;
  maxPageWidth: number;
  heightWillOverflowDocument: (height: number) => boolean;
  createNewPage: () => void;
  drawBorder: (x: number, y: number, xSize: number, ySize: number) => void;
  splitParagraph: (paragraph: Paragraph) => string[];
  getParagraphHeight: (paragraph: Paragraph) => number;
  addParagraph: (paragraph: Paragraph) => void;
}
