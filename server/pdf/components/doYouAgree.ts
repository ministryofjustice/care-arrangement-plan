import { AcroFormRadioButton } from 'jspdf';

import { Paragraph } from '../../@types/pdf';
import {
  LINE_HEIGHT_RATIO,
  MAIN_TEXT_SIZE,
  MARGIN_WIDTH,
  MM_PER_POINT,
  PARAGRAPH_SPACE,
} from '../../constants/pdfConstants';
import logger from '../../logging/logger';
import FontStyles from '../fontStyles';
import Pdf from '../pdf';

import BaseComponent from './base';

class DoYouAgree extends BaseComponent {
  private readonly radioGroup: AcroFormRadioButton;

  private readonly CHECKBOX_SIZE = 6;
  private readonly CHECKBOX_TEXT_GAP = 2;
  private readonly OPTION_GAP = 4;
  private readonly checkboxPositions: { x: number; y: number }[] = [];
  private readonly doYouAgreeParagraph: Paragraph;

  constructor(pdf: Pdf, text: string) {
    super(pdf);
    this.doYouAgreeParagraph = {
      text,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: 2,
    };
    this.radioGroup = new AcroFormRadioButton();
    this.radioGroup.radio = true;
    this.radioGroup.caption = '8';
  }

  private drawCheckboxBorder(x: number, y: number) {
    this.pdf.document.setDrawColor(0, 0, 0);
    this.pdf.document.setLineWidth(0.4);
    this.pdf.document.rect(x, y, this.CHECKBOX_SIZE, this.CHECKBOX_SIZE);
  }

  private addOption(text: string) {
    const x = MARGIN_WIDTH;
    const y = this.pdf.currentY;

    this.pdf.document.setFillColor(241, 244, 255);
    this.pdf.document.rect(x, y, this.CHECKBOX_SIZE, this.CHECKBOX_SIZE, 'F');
    this.drawCheckboxBorder(x, y);
    this.pdf.document.setFillColor(0, 0, 0);

    this.pdf.addText({
      text,
      x: x + this.CHECKBOX_SIZE + this.CHECKBOX_TEXT_GAP,
      y: y + this.CHECKBOX_SIZE / 2 + 0.25 * LINE_HEIGHT_RATIO * MAIN_TEXT_SIZE * MM_PER_POINT,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
    });

    Object.assign(this.radioGroup.createOption(text), {
      x,
      y,
      width: this.CHECKBOX_SIZE,
      height: this.CHECKBOX_SIZE,
    });
    this.checkboxPositions.push({ x, y });

    this.pdf.currentY += this.CHECKBOX_SIZE;
  }

  protected getComponentHeight() {
    return (
      this.pdf.getParagraphHeight(this.doYouAgreeParagraph) +
      this.CHECKBOX_SIZE +
      this.OPTION_GAP +
      this.CHECKBOX_SIZE +
      PARAGRAPH_SPACE
    );
  }

  protected createComponent() {
    this.pdf.addParagraph(this.doYouAgreeParagraph);

    this.pdf.document.addField(this.radioGroup);

    this.addOption(this.pdf.request.__('sharePlan.yourProposedPlan.yes'));
    this.pdf.currentY += this.OPTION_GAP;
    this.addOption(this.pdf.request.__('sharePlan.yourProposedPlan.no'));

    // Set appearance must be done after the options are created, or it will not work
    // @ts-expect-error There is an error into the jsPDF type declaration.
    this.radioGroup.setAppearance(this.pdf.document.AcroForm.Appearance.RadioButton.Cross);
    this.checkboxPositions.forEach(({ x, y }) => this.drawCheckboxBorder(x, y));

    this.pdf.currentY += PARAGRAPH_SPACE;
  }

  protected handleComponentOverflowingPage() {
    this.pdf.createNewPage();
    if (this.pdf.heightWillOverflowDocument(this.getComponentHeight())) {
      logger.error('Creating a PDF with an overflowing page');
    }
    this.createComponent();
  }
}

export default DoYouAgree;
