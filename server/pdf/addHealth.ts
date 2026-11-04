import { Request } from 'express';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addRoutineDecisions = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    request.__('sharePlan.health.sectionTitle'),
    request.__('taskList.health.title'),
    request.__('sharePlan.health.routineDecisions.question'),
    request.__('sharePlan.health.routineDecisions.description'),
    undefined,
    undefined
  );
};

const addHealthNeeds = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.health.routineDecisions.question'),
    request.__('sharePlan.health.routineDecisions.description'),
    undefined,
    undefined
  );
};

const addHealth = (pdf: Pdf) => {
  const request = pdf.request;
  addRoutineDecisions(pdf, request);
  addHealthNeeds(pdf, request);
};

export default addHealth;
