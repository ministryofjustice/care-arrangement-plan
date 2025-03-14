import i18n from 'i18n'
import { PdfBuilder } from '../@types/pdf'
import TextComponent from './components/text'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE, SECTION_HEADING_SIZE } from '../constants/pdfConstants'
import FontStyles from './fontStyles'
import DoYouAgreeComponent from './components/doYouAgree'
import TextboxComponent from './components/textbox'

const addAnswer = (
  pdf: PdfBuilder,
  sectionHeading: string | undefined,
  question: string,
  subtext: string | undefined,
  answer: string | undefined,
  disagreeText: string,
) => {
  if (!answer) return

  new TextComponent(
    pdf,
    [
      sectionHeading
        ? {
            text: sectionHeading,
            size: SECTION_HEADING_SIZE,
            style: FontStyles.BOLD,
            bottomPadding: PARAGRAPH_SPACE,
          }
        : undefined,
      {
        text: question,
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      subtext
        ? {
            text: subtext,
            size: MAIN_TEXT_SIZE,
            style: FontStyles.NORMAL,
            bottomPadding: PARAGRAPH_SPACE,
          }
        : undefined,
      {
        text: answer,
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ].filter(paragraph => !!paragraph),
  ).addComponentToDocument()

  new DoYouAgreeComponent(pdf, i18n.__('sharePlan.yourProposedPlan.doYouAgree')).addComponentToDocument()

  new TextboxComponent(pdf, [
    {
      text: disagreeText,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()
}

export default addAnswer
