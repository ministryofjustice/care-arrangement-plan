import { Request } from 'express';

import { PdfBuilder } from '../@types/pdf';
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE } from '../constants/pdfConstants';
import {
  getBetweenHouseholds,
  whereHandover,
  willChangeDuringSchoolHolidays,
  howChangeDuringSchoolHolidays,
  itemsForChangeover,
} from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';

const addGetBetweenHouseholds = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    request.__('taskList.handoverAndHolidays'),
    request.__('handoverAndHolidays.getBetweenHouseholds.title'),
    undefined,
    getBetweenHouseholds(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.getBetweenHouseholds'),
  );
};

const addWhereHandover = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('handoverAndHolidays.whereHandover.title'),
    request.__('handoverAndHolidays.whereHandover.explainer'),
    whereHandover(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.whereHandover'),
  );
};

const addWillChangeDuringSchoolHolidays = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('handoverAndHolidays.willChangeDuringSchoolHolidays.title'),
    undefined,
    willChangeDuringSchoolHolidays(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.willChangeDuringSchoolHolidays'),
  );
};

const addHowChangeDuringSchoolHolidays = (pdf: PdfBuilder, request: Request) => {
  const answer = howChangeDuringSchoolHolidays(request);

  if (answer) {
    addAnswer(
      pdf,
      undefined,
      request.__('handoverAndHolidays.howChangeDuringSchoolHolidays.title'),
      request.__('handoverAndHolidays.howChangeDuringSchoolHolidays.content'),
      answer,
      request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.howChangeDuringSchoolHolidays'),
    );
  }
};

const addItemsForChangeover = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('handoverAndHolidays.itemsForChangeover.title'),
    undefined,
    itemsForChangeover(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.itemsForChangeover'),
  );
};

const addHandoverAndHolidays = (pdf: PdfBuilder) => {
  const request = pdf.request;
  addGetBetweenHouseholds(pdf, request);
  addWhereHandover(pdf, request);
  addWillChangeDuringSchoolHolidays(pdf, request);
  addHowChangeDuringSchoolHolidays(pdf, request);
  addItemsForChangeover(pdf, request);

  new TextboxComponent(pdf, [
    {
      text: request.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.compromise.handoverAndHolidays'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addHandoverAndHolidays;
