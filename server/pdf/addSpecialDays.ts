import i18n from 'i18n'
import { Request } from 'express'
import { PdfBuilder } from '../@types/pdf'
import TextboxComponent from './components/textbox'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE } from '../constants/pdfConstants'
import { whatWillHappen } from '../utils/formattedAnswersForPdf'
import FontStyles from './fontStyles'
import addAnswer from './addAnswer'

const addSpecialDays = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('taskList.specialDays'),
    i18n.__('specialDays.whatWillHappen.title'),
    i18n.__('specialDays.whatWillHappen.content'),
    whatWillHappen(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.specialDays.whatWillHappen'),
  )

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
