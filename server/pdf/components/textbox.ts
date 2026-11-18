import { AcroFormTextField } from 'jspdf';

import { Paragraph } from '../../@types/pdf';
import { MARGIN_WIDTH, PARAGRAPH_SPACE } from '../../constants/pdfConstants';
import Pdf from '../pdf';

import TextComponent from './text';

class Textbox extends TextComponent {
  private readonly height: number;

  constructor(pdf: Pdf, paragraphs: Paragraph[], height = 20) {
    super(pdf, paragraphs);
    this.height = height;
  }

  protected getComponentHeight() {
    return super.getComponentHeight() + this.height + PARAGRAPH_SPACE;
  }

  protected createComponent() {
    super.createComponent();

    const textField = new AcroFormTextField();
    textField.multiline = true;
    textField.x = MARGIN_WIDTH;
    textField.y = this.pdf.currentY;
    textField.width = this.pdf.maxPageWidth;
    textField.height = this.height;
    this.pdf.document.addField(textField);
    this.pdf.drawBorder(MARGIN_WIDTH, this.pdf.currentY, this.pdf.maxPageWidth, this.height);
    this.pdf.currentY += this.height + PARAGRAPH_SPACE;
  }
}

export default Textbox;
