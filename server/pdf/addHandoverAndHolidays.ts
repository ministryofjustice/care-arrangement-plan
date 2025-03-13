import i18n from 'i18n'
import { Request } from 'express'
import { PdfBuilder } from '../@types/pdf'
import TextComponent from './components/text'
import TextboxComponent from './components/textbox'
import DoYouAgreeComponent from './components/doYouAgree'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE, SECTION_HEADING_SIZE } from '../constants/pdfConstants'
import {
  getBetweenHouseholds,
  whereHandover,
  willChangeDuringSchoolHolidays,
  howChangeDuringSchoolHolidays,
  itemsForChangeover,
} from '../utils/formattedAnswersForPdf'
import FontStyles from './fontStyles'

const addAnswer = (
  pdf: PdfBuilder,
  question: string,
  subtext: string | undefined,
  answer: string,
  disagreeText: string,
) => {
  new TextComponent(
    pdf,
    [
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

const addWhereHandover = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('handoverAndHolidays.whereHandover.title'),
    i18n.__('handoverAndHolidays.whereHandover.explainer'),
    whereHandover(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.whereHandover'),
  )
}

const addWillChangeDuringSchoolHolidays = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('handoverAndHolidays.willChangeDuringSchoolHolidays.title'),
    undefined,
    willChangeDuringSchoolHolidays(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.willChangeDuringSchoolHolidays'),
  )
}

const addHowChangeDuringSchoolHolidays = (pdf: PdfBuilder, request: Request) => {
  const answer = howChangeDuringSchoolHolidays(request.session)

  if (answer) {
    addAnswer(
      pdf,
      i18n.__('handoverAndHolidays.howChangeDuringSchoolHolidays.title'),
      i18n.__('handoverAndHolidays.howChangeDuringSchoolHolidays.content'),
      answer,
      i18n.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.howChangeDuringSchoolHolidays'),
    )
  }
}

const addItemsForChangeover = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('handoverAndHolidays.itemsForChangeover.title'),
    undefined,
    itemsForChangeover(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.itemsForChangeover'),
  )
}

const addHandoverAndHolidays = (pdf: PdfBuilder, request: Request) => {
  new TextComponent(pdf, [
    {
      text: i18n.__('taskList.handoverAndHolidays'),
      size: SECTION_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('handoverAndHolidays.getBetweenHouseholds.title'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: getBetweenHouseholds(request.session),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  new DoYouAgreeComponent(pdf, i18n.__('sharePlan.yourProposedPlan.doYouAgree')).addComponentToDocument()

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.getBetweenHouseholds'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  addWhereHandover(pdf, request)
  addWillChangeDuringSchoolHolidays(pdf, request)
  addHowChangeDuringSchoolHolidays(pdf, request)
  addItemsForChangeover(pdf, request)

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.compromise.handoverAndHolidays'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()
}

export default addHandoverAndHolidays
