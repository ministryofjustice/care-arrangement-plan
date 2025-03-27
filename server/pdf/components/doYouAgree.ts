import { AcroFormRadioButton } from 'jspdf';

import { Paragraph } from '../../@types/pdf';
import {
  LINE_HEIGHT_RATIO,
  MAIN_TEXT_SIZE,
  MARGIN_WIDTH,
  MM_PER_POINT,
  PARAGRAPH_SPACE,
} from '../../constants/pdfConstants';
import logger from '../../logger';
import FontStyles from '../fontStyles';
import Pdf from '../pdf';

import BaseComponent from './base';

class DoYouAgree extends BaseComponent {
  private readonly radioGroup: AcroFormRadioButton;

  private currentX = MARGIN_WIDTH;

  private readonly CHECKBOX_SIZE = 10;
  private readonly CHECKBOX_HORIZONTAL_GAP = 7;
  private readonly CHECKBOX_TEXT_GAP = 3;
  private readonly doYouAgreeParagraph: Paragraph;

  constructor(pdf: Pdf, text: string) {
    super(pdf);
    this.doYouAgreeParagraph = {
      text,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: this.CHECKBOX_TEXT_GAP,
    };
    this.radioGroup = new AcroFormRadioButton();
    this.radioGroup.radio = true;
    this.radioGroup.caption = '8';
  }

  private addOption(text: string) {
    const textWithStyles = {
      text,
      x: this.currentX,
      y: this.pdf.currentY + this.CHECKBOX_SIZE / 2 + 0.25 * LINE_HEIGHT_RATIO * MAIN_TEXT_SIZE * MM_PER_POINT,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
    };

    this.pdf.addText(textWithStyles);

    this.currentX += this.pdf.getTextWidth(textWithStyles) + this.CHECKBOX_TEXT_GAP;

    this.pdf.drawBorder(this.currentX, this.pdf.currentY, this.CHECKBOX_SIZE, this.CHECKBOX_SIZE);
    Object.assign(this.radioGroup.createOption(text), {
      x: this.currentX,
      y: this.pdf.currentY,
      width: this.CHECKBOX_SIZE,
      height: this.CHECKBOX_SIZE,
    });

    this.currentX += this.CHECKBOX_SIZE + this.CHECKBOX_HORIZONTAL_GAP;
  }

  protected getComponentHeight() {
    return this.pdf.getParagraphHeight(this.doYouAgreeParagraph) + this.CHECKBOX_SIZE + PARAGRAPH_SPACE;
  }

  protected createComponent() {
    this.pdf.addParagraph(this.doYouAgreeParagraph);

    this.pdf.document.addField(this.radioGroup);

    this.addOption(this.pdf.request.__('yes'));
    this.addOption(this.pdf.request.__('no'));

    // Set appearance must be done after the options are created, or it will not work
    // @ts-expect-error There is an error into the jsPDF type declaration.
    this.radioGroup.setAppearance(this.pdf.document.AcroForm.Appearance.RadioButton.Cross);

    this.pdf.currentY += this.CHECKBOX_SIZE + PARAGRAPH_SPACE;
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
