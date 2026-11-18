import { AcroFormTextField } from 'jspdf';

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

const SHORT_BOX_HEIGHT = 8;
const SIGNATURE_BOX_HEIGHT = 15;
const ROW_GAP = 2.5;
const COLUMN_GAP = 16;
const LABEL_GAP = 4;
const BORDER_WIDTH = 0.4;

type SignatureRow = {
  label: string;
  height: number;
  fieldName: string;
  multiline: boolean;
};

class SignatureFields extends BaseComponent {
  private readonly rows: SignatureRow[];

  constructor(pdf: Pdf) {
    super(pdf);
    const label = (key: string) => pdf.request.__(`sharePlan.endOfForm.jointAgreement.${key}`);
    this.rows = [
      { label: label('Name'), height: SHORT_BOX_HEIGHT, fieldName: 'jointAgreementName', multiline: false },
      {
        label: label('Signature'),
        height: SIGNATURE_BOX_HEIGHT,
        fieldName: 'jointAgreementSignature',
        multiline: true,
      },
      { label: label('Date'), height: SHORT_BOX_HEIGHT, fieldName: 'jointAgreementDate', multiline: false },
    ];
  }

  private labelColumnWidth() {
    const widestLabel = Math.max(
      ...this.rows.map((row) =>
        this.pdf.getTextWidth({ text: row.label, size: MAIN_TEXT_SIZE, style: FontStyles.NORMAL }),
      ),
    );
    return widestLabel + LABEL_GAP;
  }

  private boxWidth() {
    return (this.pdf.maxPageWidth - this.labelColumnWidth() * 2 - COLUMN_GAP) / 2;
  }

  protected getComponentHeight() {
    const rowsHeight = this.rows.reduce((total, row) => total + row.height, 0);
    return rowsHeight + ROW_GAP * (this.rows.length - 1) + PARAGRAPH_SPACE;
  }

  private drawRow(row: SignatureRow, y: number) {
    const labelColumnWidth = this.labelColumnWidth();
    const boxWidth = this.boxWidth();
    const columnWidth = labelColumnWidth + boxWidth;

    [0, 1].forEach((column) => {
      const x = MARGIN_WIDTH + column * (columnWidth + COLUMN_GAP);
      const boxX = x + labelColumnWidth;

      this.pdf.document.setFillColor(241, 244, 255);
      this.pdf.document.rect(boxX, y, boxWidth, row.height, 'F');
      this.pdf.document.setDrawColor(0, 0, 0);
      this.pdf.document.setLineWidth(BORDER_WIDTH);
      this.pdf.document.rect(boxX, y, boxWidth, row.height);
      this.pdf.document.setFillColor(0, 0, 0);

      this.pdf.addText({
        text: row.label,
        x,
        y: y + row.height / 2 + 0.25 * LINE_HEIGHT_RATIO * MAIN_TEXT_SIZE * MM_PER_POINT,
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
      });

      const textField = new AcroFormTextField();
      textField.fieldName = `${row.fieldName}${column + 1}`;
      textField.multiline = row.multiline;
      textField.x = boxX;
      textField.y = y;
      textField.width = boxWidth;
      textField.height = row.height;
      this.pdf.document.addField(textField);
    });
  }

  protected createComponent() {
    this.rows.forEach((row, index) => {
      this.drawRow(row, this.pdf.currentY);
      this.pdf.currentY += row.height;
      this.pdf.currentY += index === this.rows.length - 1 ? PARAGRAPH_SPACE : ROW_GAP;
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

export default SignatureFields;
