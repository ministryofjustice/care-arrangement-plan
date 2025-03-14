import i18n from 'i18n'
import { Request } from 'express'
import { PdfBuilder } from '../@types/pdf'
import TextboxComponent from './components/textbox'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE } from '../constants/pdfConstants'
import {
  getBetweenHouseholds,
  whereHandover,
  willChangeDuringSchoolHolidays,
  howChangeDuringSchoolHolidays,
  itemsForChangeover,
} from '../utils/formattedAnswersForPdf'
import FontStyles from './fontStyles'
import addAnswer from './addAnswer'

const addGetBetweenHouseholds = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('taskList.handoverAndHolidays'),
    i18n.__('handoverAndHolidays.getBetweenHouseholds.title'),
    undefined,
    getBetweenHouseholds(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.getBetweenHouseholds'),
  )
}

const addWhereHandover = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    i18n.__('handoverAndHolidays.whereHandover.title'),
    i18n.__('handoverAndHolidays.whereHandover.explainer'),
    whereHandover(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.whereHandover'),
  )
}

const addWillChangeDuringSchoolHolidays = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
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
      undefined,
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
    undefined,
    i18n.__('handoverAndHolidays.itemsForChangeover.title'),
    undefined,
    itemsForChangeover(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.itemsForChangeover'),
  )
}

const addHandoverAndHolidays = (pdf: PdfBuilder, request: Request) => {
  addGetBetweenHouseholds(pdf, request)
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
