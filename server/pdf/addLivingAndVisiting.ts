import { Request } from 'express';

import {
    mostlyLive,
    whichDaysDaytimeVisits,
    whichDaysOvernight,
    whichSchedule,
    willDaytimeVisitsHappen,
    willOvernightsHappen,
} from '../utils/formattedAnswersForPdf';
import { parentNotMostlyLivedWith } from '../utils/sessionHelpers';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addMostlyLive = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    request.__('sharePlan.yourProposedPlan.livingAndVisiting.sectionTitle'),
    request.__('taskList.livingAndVisiting'),
    request.__('sharePlan.yourProposedPlan.livingAndVisiting.mostlyLiveTitle'),
    undefined,
    mostlyLive(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.mostlyLive'),
  );
};

const addWhichSchedule = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('livingAndVisiting.whichSchedule.title'),
    request.__('livingAndVisiting.whichSchedule.exactSplitWarning'),
    whichSchedule(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichSchedule'),
  );
};

const addWillOvernightsHappen = (pdf: Pdf, request: Request) => {
  const adult = parentNotMostlyLivedWith(request.session);

  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('livingAndVisiting.willOvernightsHappen.title', { adult }),
    undefined,
    willOvernightsHappen(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willOvernightsHappen', { adult }),
  );
};

const addWhichDaysOvernight = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('livingAndVisiting.whichDaysOvernight.title'),
    undefined,
    whichDaysOvernight(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysOvernight', {
      adult: parentNotMostlyLivedWith(request.session),
    }),
  );
};

const addWillDaytimeVisitsHappen = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('livingAndVisiting.willDaytimeVisitsHappen.title', { adult: parentNotMostlyLivedWith(request.session) }),
    undefined,
    willDaytimeVisitsHappen(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.willDaytimeVisitsHappen'),
  );
};

const addWWhichDaysDaytimeVisits = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('livingAndVisiting.whichDaysDaytimeVisits.title'),
    undefined,
    whichDaysDaytimeVisits(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.livingAndVisiting.whichDaysDaytimeVisits'),
  );
};

const addLivingAndVisiting = (pdf: Pdf) => {
  const request = pdf.request;
  addMostlyLive(pdf, request);
  addWhichSchedule(pdf, request);
  addWillOvernightsHappen(pdf, request);
  addWhichDaysOvernight(pdf, request);
  addWillDaytimeVisitsHappen(pdf, request);
  addWWhichDaysDaytimeVisits(pdf, request);
};

export default addLivingAndVisiting;
