import { Request } from 'express';

import { PdfBuilder } from '../@types/pdf';
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE } from '../constants/pdfConstants';
import { planLastMinuteChanges, planLongTermNotice, planReview } from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';

const addPlanLastMinuteChanges = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    request.__('taskList.decisionMaking'),
    request.__('decisionMaking.planLastMinuteChanges.title'),
    request.__('decisionMaking.planLastMinuteChanges.howChangesCommunicatedAdditionalDescription'),
    planLastMinuteChanges(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLastMinuteChanges'),
  );
};

const addPlanLongTermNotice = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('decisionMaking.planLongTermNotice.title'),
    request.__('decisionMaking.planLongTermNotice.sometimesYouNeedToPlanAhead'),
    planLongTermNotice(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLongTermNotice'),
  );
};

const addPlanReview = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    request.__('decisionMaking.planReview.title'),
    request.__('decisionMaking.planReview.childrensNeedsChange'),
    planReview(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planReview'),
  );
};

const addDecisionMaking = (pdf: PdfBuilder) => {
  const request = pdf.request;

  addPlanLastMinuteChanges(pdf, request);
  addPlanLongTermNotice(pdf, request);
  addPlanReview(pdf, request);

  new TextboxComponent(pdf, [
    {
      text: request.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.compromise.decisionMaking'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addDecisionMaking;
