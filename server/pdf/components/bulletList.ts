import TextComponent from './text'
import { Paragraph, PdfBuilder } from '../../@types/pdf'
import { BULLET_POINT_SPACING, MAIN_TEXT_SIZE, PARAGRAPH_SPACE } from '../../constants/pdfConstants'
import FontStyles from '../fontStyles'

class BulletList extends TextComponent {
  constructor(
    pdf: PdfBuilder,
    {
      initialText,
      bulletText,
      finalText,
    }: { initialText?: Paragraph[]; bulletText: string[]; finalText?: Paragraph[] },
  ) {
    const paragraphs: Paragraph[] = initialText || []
    for (let i = 0; i < bulletText.length; i++) {
      paragraphs.push({
        text: `•   ${bulletText[i]}`,
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: i === bulletText.length - 1 ? PARAGRAPH_SPACE : BULLET_POINT_SPACING,
      })
    }
    if (finalText) paragraphs.push(...finalText)
    super(pdf, paragraphs)
  }
}

export default BulletList
