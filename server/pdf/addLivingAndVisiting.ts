import i18n from 'i18n'
import { Request } from 'express'
import { PdfBuilder } from '../@types/pdf'
import TextComponent from './components/text'
import TextboxComponent from './components/textbox'
import DoYouAgreeComponent from './components/doYouAgree'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE, SECTION_HEADING_SIZE } from '../constants/pdfConstants'
import {
  whichDaysDaytimeVisits,
  whichDaysOvernight,
  willDaytimeVisitsHappen,
  mostlyLive,
  whichSchedule,
  willOvernightsHappen,
} from '../utils/formattedAnswersForPdf'
import FontStyles from './fontStyles'
import { parentNotMostlyLivedWith } from '../utils/sessionHelpers'

const addAnswer = (
  pdf: PdfBuilder,
  question: string,
  subtext: string | undefined,
  answer: string | undefined,
  disagreeText: string,
) => {
  if (!answer) return

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

const addWhichSchedule = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('livingAndVisiting.whichSchedule.title'),
    i18n.__('livingAndVisiting.whichSchedule.exactSplitWarning'),
    whichSchedule(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichSchedule'),
  )
}

const addWillOvernightsHappen = (pdf: PdfBuilder, request: Request) => {
  const adult = parentNotMostlyLivedWith(request.session)

  addAnswer(
    pdf,
    i18n.__('livingAndVisiting.willOvernightsHappen.title', { adult }),
    undefined,
    willOvernightsHappen(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willOvernightsHappen', { adult }),
  )
}

const addWhichDaysOvernight = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('livingAndVisiting.whichDaysOvernight.title'),
    undefined,
    whichDaysOvernight(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysOvernight', {
      adult: parentNotMostlyLivedWith(request.session),
    }),
  )
}

const addWillDaytimeVisitsHappen = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('livingAndVisiting.willDaytimeVisitsHappen.title', { adult: parentNotMostlyLivedWith(request.session) }),
    undefined,
    willDaytimeVisitsHappen(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willDaytimeVisitsHappen'),
  )
}

const addWWhichDaysDaytimeVisits = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('livingAndVisiting.whichDaysDaytimeVisits.title'),
    undefined,
    whichDaysDaytimeVisits(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysDaytimeVisits'),
  )
}

const addLivingAndVisiting = (pdf: PdfBuilder, request: Request) => {
  new TextComponent(pdf, [
    {
      text: i18n.__('taskList.livingAndVisiting'),
      size: SECTION_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('livingAndVisiting.mostlyLive.title'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: mostlyLive(request.session),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  new DoYouAgreeComponent(pdf, i18n.__('sharePlan.yourProposedPlan.doYouAgree')).addComponentToDocument()

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.mostlyLive'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  addWhichSchedule(pdf, request)
  addWillOvernightsHappen(pdf, request)
  addWhichDaysOvernight(pdf, request)
  addWillDaytimeVisitsHappen(pdf, request)
  addWWhichDaysDaytimeVisits(pdf, request)

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.compromise.livingAndVisiting'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()
}

export default addLivingAndVisiting
