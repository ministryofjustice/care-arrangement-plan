import i18n from 'i18n'
import { Request } from 'express'
import { PdfBuilder } from '../@types/pdf'
import TextComponent from './components/text'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, SECTION_HEADING_SIZE } from '../constants/pdfConstants'

const addWhatHappensNow = (pdf: PdfBuilder, request: Request) => {
  new TextComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.whatHappensNowHeading'),
      size: SECTION_HEADING_SIZE,
      style: 'bold',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.nowSendPlan', { senderName: request.session.initialAdultName }),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.unableToAgree'),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.moreInfoAndSupport'),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()
}

export default addWhatHappensNow
