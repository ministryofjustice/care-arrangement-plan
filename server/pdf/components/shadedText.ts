import { MARGIN_WIDTH, PARAGRAPH_SPACE } from '../../constants/pdfConstants';

import Text from './text';

class ShadedText extends Text {
  private readonly padding = 2;

  protected getComponentHeight() {
    return super.getComponentHeight() + this.padding * 2 + PARAGRAPH_SPACE;
  }

  protected createComponent() {
    const top = this.pdf.currentY;
    const innerHeight = super.getComponentHeight();
    const width = this.pdf.document.internal.pageSize.getWidth() - 2 * MARGIN_WIDTH;

    this.pdf.document.setFillColor(227, 227, 227);
    this.pdf.document.rect(
      MARGIN_WIDTH - this.padding,
      top,
      width + this.padding * 2,
      innerHeight + this.padding * 2,
      'F',
    );
    this.pdf.document.setFillColor(0, 0, 0);

    this.pdf.currentY = top + this.padding;
    super.createComponent();
    this.pdf.currentY += this.padding + PARAGRAPH_SPACE;
  }
}

export default ShadedText;
