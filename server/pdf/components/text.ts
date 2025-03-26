import { Paragraph } from '../../@types/pdf';
import logger from '../../logger';
import Pdf from '../pdf';

import BaseComponent from './base';

class Text extends BaseComponent {
  private readonly paragraphs: Paragraph[];

  constructor(pdf: Pdf, paragraphs: Paragraph[]) {
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
    if (this.pdf.heightWillOverflowDocument(this.getComponentHeight())) {
      logger.error('Creating a PDF with an overflowing page');
    }
    this.createComponent();
  }
}

export default Text;
