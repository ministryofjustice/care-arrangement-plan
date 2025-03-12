import i18n from 'i18n'
import { Request } from 'express'
import { PdfBuilder } from '../@types/pdf'
import TextComponent from './components/text'
import TextboxComponent from './components/textbox'
import DoYouAgreeComponent from './components/doYouAgree'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE, SECTION_HEADING_SIZE } from '../constants/pdfConstants'
import { whatWillHappen } from '../utils/formattedAnswersForPdf'
import FontStyles from './fontStyles'

const addSpecialDays = (pdf: PdfBuilder, request: Request) => {
  new TextComponent(pdf, [
    {
      text: i18n.__('taskList.specialDays'),
      size: SECTION_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('specialDays.whatWillHappen.title'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('specialDays.whatWillHappen.content'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: whatWillHappen(request.session),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  new DoYouAgreeComponent(pdf, i18n.__('sharePlan.yourProposedPlan.doYouAgree')).addComponentToDocument()

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.doNotAgree.specialDays.whatWillHappen'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.compromise.specialDays'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()
}

export default addSpecialDays
