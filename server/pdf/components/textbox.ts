import { AcroFormTextField } from 'jspdf'
import BaseComponent from './base'
import { Paragraph, PdfBuilder } from '../../@types/pdf'
import { MAIN_TEXT_SIZE, MARGIN_WIDTH, PARAGRAPH_SPACE } from '../../constants/pdfConstants'

class Textbox extends BaseComponent {
  private readonly textParagraph: Paragraph

  private readonly TEXTBOX_HEIGHT = 20

  constructor(pdf: PdfBuilder, text: string) {
    super(pdf)
    this.textParagraph = {
      text,
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    }
  }

  protected getComponentHeight() {
    return this.pdf.getParagraphHeight(this.textParagraph) + this.TEXTBOX_HEIGHT + PARAGRAPH_SPACE
  }

  protected createComponent() {
    this.pdf.addParagraph(this.textParagraph)

    const textField = new AcroFormTextField()
    textField.multiline = true
    textField.x = MARGIN_WIDTH
    textField.y = this.pdf.currentY
    textField.width = this.pdf.maxPageWidth
    textField.height = this.TEXTBOX_HEIGHT
    this.pdf.document.addField(textField)
    this.pdf.drawBorder(MARGIN_WIDTH, this.pdf.currentY, this.pdf.maxPageWidth, this.TEXTBOX_HEIGHT)
    this.pdf.currentY += this.TEXTBOX_HEIGHT + PARAGRAPH_SPACE
  }

  protected handleComponentOverflowingPage() {
    this.pdf.createNewPage()
    this.createComponent()
  }
}

export default Textbox
