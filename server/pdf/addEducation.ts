import { Request } from 'express';

import {
  educationRoutineDecisions,
  educationSchoolMeetings,
  educationShareInformation,
} from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addSchoolInfo = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    request.__('sharePlan.education.sectionTitle'),
    request.__('sharePlan.education.title'),
    request.__('sharePlan.education.schoolInfo.question'),
    request.__('education.shareInformation.description'),
    educationShareInformation(request),
    request.__('sharePlan.education.schoolInfo.doNotAgree'),
  );
};

const routineDecisions = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.education.routineDecisions.question'),
    request.__('education.routineDecisions.description'),
    educationRoutineDecisions(request),
    request.__('sharePlan.education.routineDecisions.doNotAgree'),
  );
};

const schoolMeetings = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.education.schoolMeetings.question'),
    request.__('education.schoolMeetings.description'),
    educationSchoolMeetings(request),
    request.__('sharePlan.education.schoolMeetings.doNotAgree'),
  );
};

const addEducation = (pdf: Pdf) => {
  const request = pdf.request;
  addSchoolInfo(pdf, request);
  routineDecisions(pdf, request);
  schoolMeetings(pdf, request);
};

export default addEducation;
