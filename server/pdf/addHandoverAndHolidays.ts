import { Request } from 'express';

import {
  getBetweenHouseholds,
  howChangeDuringSchoolHolidays,
  itemsForChangeover,
  travelAbroad,
  travelDocuments,
  travelInformation,
  whereHandover,
  willChangeDuringSchoolHolidays,
} from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addGetBetweenHouseholds = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.sectionTitle'),
    request.__('taskList.handoverAndHolidays.title'),
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
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.handoverIntro'),
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
      request.__('sharePlan.yourProposedPlan.handoverAndHolidays.howChangeDuringSchoolHolidays.title'),
      request.__('sharePlan.yourProposedPlan.handoverAndHolidays.howChangeDuringSchoolHolidays.intro'),
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
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.itemsForChangeover.title'),
    undefined,
    itemsForChangeover(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.itemsForChangeover'),
  );
};

const addTravelAbroad = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelAbroad.title'),
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelAbroad.intro'),
    travelAbroad(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.travelAbroad'),
  );
};

const addTravelDocuments = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelDocuments.title'),
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelDocuments.intro'),
    travelDocuments(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.travelDocuments'),
  );
};

const addConsentToTravel = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.consentToTravel.title'),
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.consentToTravel.parentalResponsibility'),
    undefined
  );
};

const addTravelInformation = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelInformation.title'),
    undefined,
    travelInformation(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.travelInformation'),
  );
};

const addHandoverAndHolidays = (pdf: Pdf) => {
  const request = pdf.request;
  addGetBetweenHouseholds(pdf, request);
  addWhereHandover(pdf, request);
  addWillChangeDuringSchoolHolidays(pdf, request);
  addHowChangeDuringSchoolHolidays(pdf, request);
  addItemsForChangeover(pdf, request);
  addTravelAbroad(pdf, request);
  addTravelDocuments(pdf, request);
  addConsentToTravel(pdf, request);
  addTravelInformation(pdf, request);
};

export default addHandoverAndHolidays;
