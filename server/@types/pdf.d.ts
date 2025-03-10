import JsPdf from 'jspdf'

export type Paragraph = {
  text: string
  size: number
  style: 'normal' | 'bold'
  bottomPadding: number
}

export interface PdfBuilder {
  document: JsPdf
  currentY: number
  maxPageWidth: number
  heightWillOverflowDocument: (height: number) => boolean
  createNewPage: () => void
  drawBorder: (x: number, y: number, xSize: number, ySize: number) => void
  getParagraphHeight: (paragraph: Paragraph) => number
  addParagraph: (paragraph: Paragraph) => void
}
