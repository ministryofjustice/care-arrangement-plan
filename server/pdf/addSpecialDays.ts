import i18n from 'i18n'
import { Request } from 'express'
import { Paragraph, PdfBuilder } from '../@types/pdf'
import TextComponent from './components/text'
import TextboxComponent from './components/textbox'
import DoYouAgreeComponent from './components/doYouAgree'
import {
  MAIN_TEXT_SIZE,
  PARAGRAPH_SPACE,
  QUESTION_TITLE_SIZE,
  SECTION_HEADING_SIZE,
  SENDER_SUGGESTED_SPACE,
} from '../constants/pdfConstants'

const addSpecialDays = (pdf: PdfBuilder, request: Request) => {
  const answerParagraphs: Paragraph[] = request.session.specialDays.whatWillHappen.noDecisionRequired
    ? [
        {
          text: i18n.__('sharePlan.yourProposedPlan.senderSuggestedDoNotDecide', {
            senderName: request.session.initialAdultName,
          }),
          size: MAIN_TEXT_SIZE,
          style: 'normal',
          bottomPadding: PARAGRAPH_SPACE,
        },
      ]
    : [
        {
          text: i18n.__('sharePlan.yourProposedPlan.senderSuggested', {
            senderName: request.session.initialAdultName,
          }),
          size: MAIN_TEXT_SIZE,
          style: 'normal',
          bottomPadding: SENDER_SUGGESTED_SPACE,
        },
        {
          text: `"${request.session.specialDays.whatWillHappen.answer}"`,
          size: MAIN_TEXT_SIZE,
          style: 'normal',
          bottomPadding: PARAGRAPH_SPACE,
        },
      ]

  new TextComponent(pdf, [
    {
      text: i18n.__('taskList.specialDays'),
      size: SECTION_HEADING_SIZE,
      style: 'bold',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('specialDays.whatWillHappen.title'),
      size: QUESTION_TITLE_SIZE,
      style: 'bold',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('specialDays.whatWillHappen.content'),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
    ...answerParagraphs,
  ]).addComponentToDocument()

  new DoYouAgreeComponent(pdf, i18n.__('sharePlan.yourProposedPlan.doYouAgree')).addComponentToDocument()

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.doNotAgree.specialDays.whatWillHappen'),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: 'bold',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.compromise.specialDays'),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()
}

export default addSpecialDays
