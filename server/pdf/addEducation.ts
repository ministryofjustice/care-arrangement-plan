import { Request } from 'express';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addSchoolInfo = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    request.__('sharePlan.education.sectionTitle'),
    request.__('taskList.education.title'),
    request.__('sharePlan.education.schoolInfo.question'),
    request.__('sharePlan.education.schoolInfo.description'),
    undefined,
    undefined
  );
};

const routineDecisions = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.education.schoolInfo.question'),
    request.__('sharePlan.education.schoolInfo.description'),
    undefined,
    undefined
  );
};

const schoolMeetings = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.education.schoolInfo.question'),
    request.__('sharePlan.education.schoolInfo.description'),
    undefined,
    undefined
  );
};

const addEducation = (pdf: Pdf) => {
  const request = pdf.request;
  addSchoolInfo(pdf, request);
  routineDecisions(pdf, request);
  schoolMeetings(pdf, request);
};

export default addEducation;