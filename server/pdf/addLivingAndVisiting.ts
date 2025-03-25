import { Request } from 'express';

import { PdfBuilder } from '../@types/pdf';
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE } from '../constants/pdfConstants';
import {
  whichDaysDaytimeVisits,
  whichDaysOvernight,
  willDaytimeVisitsHappen,
  mostlyLive,
  whichSchedule,
  willOvernightsHappen,
} from '../utils/formattedAnswersForPdf';
import { parentNotMostlyLivedWith } from '../utils/sessionHelpers';

import addAnswer from './addAnswer';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';

const addMostlyLive = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    request.__('taskList.livingAndVisiting'),
    request.__('livingAndVisiting.mostlyLive.title'),
    undefined,
    mostlyLive(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.mostlyLive'),
  );
};

const addWhichSchedule = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('livingAndVisiting.whichSchedule.title'),
    request.__('livingAndVisiting.whichSchedule.exactSplitWarning'),
    whichSchedule(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichSchedule'),
  );
};

const addWillOvernightsHappen = (pdf: PdfBuilder, request: Request) => {
  const adult = parentNotMostlyLivedWith(request.session);

  addAnswer(
    pdf,
    undefined,
    request.__('livingAndVisiting.willOvernightsHappen.title', { adult }),
    undefined,
    willOvernightsHappen(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willOvernightsHappen', { adult }),
  );
};

const addWhichDaysOvernight = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('livingAndVisiting.whichDaysOvernight.title'),
    undefined,
    whichDaysOvernight(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysOvernight', {
      adult: parentNotMostlyLivedWith(request.session),
    }),
  );
};

const addWillDaytimeVisitsHappen = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('livingAndVisiting.willDaytimeVisitsHappen.title', { adult: parentNotMostlyLivedWith(request.session) }),
    undefined,
    willDaytimeVisitsHappen(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willDaytimeVisitsHappen'),
  );
};

const addWWhichDaysDaytimeVisits = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('livingAndVisiting.whichDaysDaytimeVisits.title'),
    undefined,
    whichDaysDaytimeVisits(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysDaytimeVisits'),
  );
};

const addLivingAndVisiting = (pdf: PdfBuilder) => {
  const request = pdf.request;
  addMostlyLive(pdf, request);
  addWhichSchedule(pdf, request);
  addWillOvernightsHappen(pdf, request);
  addWhichDaysOvernight(pdf, request);
  addWillDaytimeVisitsHappen(pdf, request);
  addWWhichDaysDaytimeVisits(pdf, request);

  new TextboxComponent(pdf, [
    {
      text: request.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.compromise.livingAndVisiting'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addLivingAndVisiting;
