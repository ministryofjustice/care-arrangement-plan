import { AcroFormTextField } from 'jspdf';

import { Paragraph, PdfBuilder } from '../../@types/pdf';
import { MARGIN_WIDTH, PARAGRAPH_SPACE } from '../../constants/pdfConstants';

import TextComponent from './text';

class Textbox extends TextComponent {
  private readonly TEXTBOX_HEIGHT = 20;

  constructor(pdf: PdfBuilder, paragraphs: Paragraph[]) {
    super(pdf, paragraphs);
  }

  protected getComponentHeight() {
    return super.getComponentHeight() + this.TEXTBOX_HEIGHT + PARAGRAPH_SPACE;
  }

  protected createComponent() {
    super.createComponent();

    const textField = new AcroFormTextField();
    textField.multiline = true;
    textField.x = MARGIN_WIDTH;
    textField.y = this.pdf.currentY;
    textField.width = this.pdf.maxPageWidth;
    textField.height = this.TEXTBOX_HEIGHT;
    this.pdf.document.addField(textField);
    this.pdf.drawBorder(MARGIN_WIDTH, this.pdf.currentY, this.pdf.maxPageWidth, this.TEXTBOX_HEIGHT);
    this.pdf.currentY += this.TEXTBOX_HEIGHT + PARAGRAPH_SPACE;
  }

  protected handleComponentOverflowingPage() {
    this.pdf.createNewPage();
    this.createComponent();
  }
}

export default Textbox;
