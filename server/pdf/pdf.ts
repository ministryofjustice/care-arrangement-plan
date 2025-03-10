import JsPdf from 'jspdf'
import fs from 'fs'
import {
  FONT,
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  LINE_HEIGHT_RATIO,
  MAIN_TEXT_SIZE,
  MARGIN_WIDTH,
  MM_PER_POINT,
  PARAGRAPH_SPACE,
  QUESTION_TITLE_SIZE,
  SECTION_HEADING_SIZE,
} from '../constants/pdfConstants'
import DoYouAgreeComponent from './components/doYouAgree'
import TextComponent from './components/text'
import TextBoxComponent from './components/textbox'
import { Paragraph, PdfBuilder } from '../@types/pdf'

class Pdf implements PdfBuilder {
  public readonly document: JsPdf

  public currentY = HEADER_HEIGHT

  public readonly maxPageWidth: number

  constructor(autoPrint: boolean) {
    // @ts-expect-error There is an error into the jsPDF type declaration.
    this.document = new JsPdf({ lineHeight: LINE_HEIGHT_RATIO })
    this.maxPageWidth = this.document.internal.pageSize.getWidth() - 2 * MARGIN_WIDTH
    this.setupFonts()
    if (autoPrint) this.document.autoPrint()
  }

  public toArrayBuffer() {
    return this.document.output('arraybuffer')
  }

  public addHeaderToEveryPage() {
    for (let pageNumber = 1; pageNumber <= this.document.getNumberOfPages(); pageNumber++) {
      this.document.setPage(pageNumber)
      this.addHeaderToPage(pageNumber)
    }
  }

  private setupFonts() {
    this.document.addFileToVFS(
      'bold-b542beb274-v2.ttf',
      fs.readFileSync('./assets/fonts/bold-b542beb274-v2.ttf').toString('base64'),
    )
    this.document.addFont('bold-b542beb274-v2.ttf', FONT, 'bold')
    this.document.addFileToVFS(
      'light-94a07e06a1-v2.ttf',
      fs.readFileSync('./assets/fonts/light-94a07e06a1-v2.ttf').toString('base64'),
    )
    this.document.addFont('light-94a07e06a1-v2.ttf', FONT, 'normal')
  }

  private addHeaderToPage(pageNumber: number) {
    this.document
      .setFillColor(0, 0, 0)
      .rect(0, 0, this.document.internal.pageSize.getWidth(), HEADER_HEIGHT, 'F')
      .setTextColor(255, 255, 255)
      .setFont(FONT, 'bold')
      .text(`Header Text - Page ${pageNumber} / ${this.document.getNumberOfPages()}`, 10, 10)
      .setTextColor(0, 0, 0)
  }

  createDoYouAgreeComponent(
    sectionHeading: string | undefined,
    title: string | undefined,
    mainText: string,
    endText: string,
    includeTextbox: boolean,
  ) {
    const initialParagraphs: Paragraph[] = []
    if (sectionHeading) {
      initialParagraphs.push({
        text: sectionHeading,
        size: SECTION_HEADING_SIZE,
        style: 'bold',
        bottomPadding: PARAGRAPH_SPACE,
      })
    }
    if (title) {
      initialParagraphs.push({ text: title, size: QUESTION_TITLE_SIZE, style: 'bold', bottomPadding: PARAGRAPH_SPACE })
    }
    initialParagraphs.push({ text: mainText, size: MAIN_TEXT_SIZE, style: 'normal', bottomPadding: PARAGRAPH_SPACE })
    new TextComponent(this, initialParagraphs).addComponentToDocument()
    new DoYouAgreeComponent(this).addComponentToDocument()

    if (includeTextbox) {
      new TextBoxComponent(this, endText).addComponentToDocument()
    } else {
      new TextComponent(this, [
        { text: endText, size: MAIN_TEXT_SIZE, style: 'normal', bottomPadding: PARAGRAPH_SPACE },
      ]).addComponentToDocument()
    }
  }

  heightWillOverflowDocument(height: number) {
    return height + this.currentY > this.document.internal.pageSize.getHeight() - FOOTER_HEIGHT
  }

  createNewPage() {
    this.document.addPage()
    this.currentY = HEADER_HEIGHT
  }

  drawBorder(x: number, y: number, xSize: number, ySize: number) {
    this.document.setDrawColor('black')
    this.document.setLineWidth(0.5)
    this.document.rect(x - 0.3, y - 0.3, xSize + 0.6, ySize + 0.6)
  }

  getParagraphHeight({ text, size, style, bottomPadding }: Paragraph) {
    this.document.setFontSize(size).setFont(FONT, style)
    const textLines = this.document.splitTextToSize(text, this.maxPageWidth)
    return size * LINE_HEIGHT_RATIO * textLines.length * MM_PER_POINT + bottomPadding
  }

  addParagraph({ text, size, style, bottomPadding }: Paragraph) {
    // The first line of text goes above the current y value, so add a single line of spacing to make the paragraph
    // behave the same as all other components we add
    this.currentY += size * LINE_HEIGHT_RATIO * MM_PER_POINT
    this.document.setFontSize(size).setFont(FONT, style)
    const textLines = this.document.splitTextToSize(text, this.maxPageWidth)
    this.document.text(textLines, MARGIN_WIDTH, this.currentY)
    this.currentY += size * LINE_HEIGHT_RATIO * (textLines.length - 1) * MM_PER_POINT + bottomPadding
  }
}

export default Pdf
