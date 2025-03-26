import { Paragraph } from '../../@types/pdf';
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE } from '../../constants/pdfConstants';
import FontStyles from '../fontStyles';
import Pdf from '../pdf';

import TextComponent from './text';

class BulletList extends TextComponent {
  constructor(
    pdf: Pdf,
    {
      initialText,
      bulletText,
      finalText,
    }: { initialText?: Paragraph[]; bulletText: string[]; finalText?: Paragraph[] },
  ) {
    const paragraphs: Paragraph[] = initialText || [];

    paragraphs.push({
      text: bulletText.map((text) => `•   ${text}`).join('\n'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    });

    if (finalText) paragraphs.push(...finalText);
    super(pdf, paragraphs);
  }
}

export default BulletList;
