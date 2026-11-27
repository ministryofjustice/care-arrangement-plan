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

import addAnswer, { escapeHtmlText } from './addAnswer';

const addGetBetweenHouseholds = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.householdsTitle'),
    undefined,
    getBetweenHouseholds(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.getBetweenHouseholds'),
    request,
  );
};

const addWhereHandover = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.handoverTitle'),
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.handoverIntro'),
    whereHandover(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.whereHandover'),
    request,
  );
};

const addWillChangeDuringSchoolHolidays = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.arrangementsTitle'),
    undefined,
    willChangeDuringSchoolHolidays(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.willChangeDuringSchoolHolidays'),
    request,
  );
};

const addHowChangeDuringSchoolHolidays = (request: Request): string => {
  const answer = howChangeDuringSchoolHolidays(request);

  if (!answer) {
    return '';
  }

  if (answer) {
    return addAnswer(
      undefined,
      undefined,
      request.__('sharePlan.yourProposedPlan.handoverAndHolidays.howChangeDuringSchoolHolidays.title'),
      request.__('sharePlan.yourProposedPlan.handoverAndHolidays.howChangeDuringSchoolHolidays.intro'),
      answer,
      request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.howChangeDuringSchoolHolidays'),
      request,
    );
  }
};

const addItemsForChangeover = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.itemsForChangeover.title'),
    undefined,
    itemsForChangeover(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.itemsForChangeover'),
    request,
  );
};

const addTravelAbroad = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelAbroad.title'),
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelAbroad.intro'),
    travelAbroad(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.travelAbroad'),
    request,
  );
};

const addTravelDocuments = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelDocuments.title'),
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelDocuments.intro'),
    travelDocuments(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.travelDocuments'),
    request,
  );
};

const addConsentToTravel = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.consentToTravel.title'),
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.consentToTravel.parentalResponsibility'),
    undefined,
    request,
  );
};

const addTravelInformation = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.yourProposedPlan.handoverAndHolidays.travelInformation.title'),
    undefined,
    travelInformation(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.handoverAndHolidays.travelInformation'),
    request,
  );
};

const addHandoverAndHolidays = (request: Request): string => {
  const answers = [
    addGetBetweenHouseholds(request),
    addWhereHandover(request),
    addWillChangeDuringSchoolHolidays(request),
    addHowChangeDuringSchoolHolidays(request),
    addItemsForChangeover(request),
    addTravelAbroad(request),
    addTravelDocuments(request),
    addConsentToTravel(request),
    addTravelInformation(request),
  ].filter((item) => item !== '');

  if (answers.length === 0) {
    return '';
  }

  let html = '<section id="handover-holidays" aria-labelledby="handover-holidays-heading">\n';
  html += `  <h1 class="section-heading-title">${escapeHtmlText(request.__('sharePlan.yourProposedPlan.handoverAndHolidays.sectionTitle'))}</h1>\n`;
  html += `  <h2 id="handover-holidays-heading" class="section-heading">${escapeHtmlText(request.__('taskList.handoverAndHolidays.title'))}</h2>\n`;
  html += answers.join('\n');
  html += '</section>\n\n';

  return html;
};

export default addHandoverAndHolidays;
