import { Request } from 'express';

import {
  planLastMinuteChanges,
  planLongTermNotice,
  planReview
} from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addPlanLastMinuteChanges = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    request.__('sharePlan.decisionMaking.sectionTitle'),
    request.__('sharePlan.decisionMaking.title'),
    request.__('sharePlan.decisionMaking.planLastMinuteChanges.title'),
    request.__('sharePlan.decisionMaking.planLastMinuteChanges.intro'),
    planLastMinuteChanges(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLastMinuteChanges'),
  );
};

const addPlanLongTermNotice = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.decisionMaking.planLongTermNotice.title'),
    request.__('sharePlan.decisionMaking.planLongTermNotice.intro'),
    planLongTermNotice(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLongTermNotice'),
  );
};

const addPlanReview = (pdf: Pdf, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    undefined,
    request.__('sharePlan.decisionMaking.planReview.title'),
    request.__('sharePlan.decisionMaking.planReview.intro'),
    planReview(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planReview'),
  );
};

const addDecisionMaking = (pdf: Pdf) => {
  const request = pdf.request;

  addPlanLastMinuteChanges(pdf, request);
  addPlanLongTermNotice(pdf, request);
  addPlanReview(pdf, request);
};

export default addDecisionMaking;
