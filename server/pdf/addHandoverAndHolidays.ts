import { Request } from 'express';

import {
    getBetweenHouseholds,
    howChangeDuringSchoolHolidays,
    itemsForChangeover,
    whereHandover,
    willChangeDuringSchoolHolidays,
} from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addGetBetweenHouseholds = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.sectionTitle'),
    request.__('taskList.handoverAndHolidays'),
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.householdsTitle'),
    undefined,
    getBetweenHouseholds(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.getBetweenHouseholds'),
  );
};

const addWhereHandover = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.handoverTitle'),
    request.__('handoverAndHolidays.whereHandover.explainer'),
    whereHandover(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.whereHandover'),
  );
};

const addWillChangeDuringSchoolHolidays = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.arrangementsTitle'),
    undefined,
    willChangeDuringSchoolHolidays(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.willChangeDuringSchoolHolidays'),
  );
};

const addHowChangeDuringSchoolHolidays = (pdf: Pdf, request: Request) => {
  const answer = howChangeDuringSchoolHolidays(request);

  if (answer) {
    addAnswer(
      pdf,
      undefined,
      undefined,
      request.__('handoverAndHolidays.howChangeDuringSchoolHolidays.title'),
      request.__('handoverAndHolidays.howChangeDuringSchoolHolidays.content'),
      answer,
      request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.howChangeDuringSchoolHolidays'),
    );
  }
};

const addItemsForChangeover = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('handoverAndHolidays.itemsForChangeover.title'),
    undefined,
    itemsForChangeover(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.itemsForChangeover'),
  );
};

const addHandoverAndHolidays = (pdf: Pdf) => {
  const request = pdf.request;
  addGetBetweenHouseholds(pdf, request);
  addWhereHandover(pdf, request);
  addWillChangeDuringSchoolHolidays(pdf, request);
  addHowChangeDuringSchoolHolidays(pdf, request);
  addItemsForChangeover(pdf, request);
};

export default addHandoverAndHolidays;
