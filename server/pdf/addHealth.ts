import { Request } from 'express';

import { childHealthNeeds, childHealthRoutineDecisions } from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addRoutineDecisions = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    request.__('sharePlan.childHealth.sectionTitle'),
    request.__('sharePlan.childHealth.title'),
    request.__('sharePlan.childHealth.routineDecisions.question'),
    request.__('childHealth.routineDecisions.description'),
    childHealthRoutineDecisions(request),
    request.__('sharePlan.childHealth.routineDecisions.doNotAgree'),
  );
};

const addHealthNeeds = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.childHealth.healthNeeds.question'),
    request.__('childHealth.healthNeeds.description'),
    childHealthNeeds(request),
    request.__('sharePlan.childHealth.healthNeeds.doNotAgree'),
  );
};

const addHealth = (pdf: Pdf) => {
  const request = pdf.request;
  addRoutineDecisions(pdf, request);
  addHealthNeeds(pdf, request);
};

export default addHealth;
