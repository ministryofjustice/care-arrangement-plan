import { Request } from 'express';

import addAnswer, { renderTextBox } from './addAnswer';

import {
  educationRoutineDecisions,
  educationSchoolMeetings,
  educationShareInformation,
} from '../utils/formattedAnswersForPdf';

const addSchoolInfo = (request: Request): string => {
  return addAnswer(
    request.__('sharePlan.education.sectionTitle'),
    request.__('sharePlan.education.title'),
    request.__('sharePlan.education.schoolInfo.question'),
    request.__('education.shareInformation.description'),
    educationShareInformation(request),
    request.__('sharePlan.education.schoolInfo.doNotAgree'),
    request
  );
};

const routineDecisions = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.education.routineDecisions.question'),
    request.__('education.routineDecisions.description'),
    educationRoutineDecisions(request),
    request.__('sharePlan.education.routineDecisions.doNotAgree'),
    request
  );
};

const schoolMeetings = (request: Request): string => {
  return addAnswer(
    undefined,
    undefined,
    request.__('sharePlan.education.schoolMeetings.question'),
    request.__('education.schoolMeetings.description'),
    educationSchoolMeetings(request),
    request.__('sharePlan.education.schoolMeetings.doNotAgree'),
    request
  );
};

const addEducation = (request: Request): string => {
  const answers = [
    addSchoolInfo(request),
    routineDecisions(request),
    schoolMeetings(request)
  ].filter((item) => item !== '');

  if (answers.length === 0) {
    return '';
  }

  let html = '<section id="education" aria-labelledby="education-heading">\n';
  html += answers.join('\n');
  html += '</section>\n\n';

  return html;
};

export default addEducation;
