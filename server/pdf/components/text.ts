import { Paragraph, PdfBuilder } from '../../@types/pdf';

import BaseComponent from './base';

class Text extends BaseComponent {
  private readonly paragraphs: Paragraph[];

  constructor(pdf: PdfBuilder, paragraphs: Paragraph[]) {
    super(pdf);
    this.paragraphs = paragraphs;
  }

  protected getComponentHeight() {
    return this.paragraphs.reduce((currentHeight, paragraph) => {
      return currentHeight + this.pdf.getParagraphHeight(paragraph);
    }, 0);
  }

  protected createComponent() {
    this.paragraphs.forEach((paragraph) => {
      this.pdf.addParagraph(paragraph);
    });
  }

  protected handleComponentOverflowingPage() {
    this.pdf.createNewPage();
    this.createComponent();
  }
}

export default Text;
