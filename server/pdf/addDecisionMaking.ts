import { Request } from 'express';
import i18n from 'i18n';

import { PdfBuilder } from '../@types/pdf';
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE } from '../constants/pdfConstants';
import { planLastMinuteChanges, planLongTermNotice, planReview } from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';

const addPlanLastMinuteChanges = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('taskList.decisionMaking'),
    i18n.__('decisionMaking.planLastMinuteChanges.title'),
    i18n.__('decisionMaking.planLastMinuteChanges.howChangesCommunicatedAdditionalDescription'),
    planLastMinuteChanges(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLastMinuteChanges'),
  );
};

const addPlanLongTermNotice = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    i18n.__('decisionMaking.planLongTermNotice.title'),
    i18n.__('decisionMaking.planLongTermNotice.sometimesYouNeedToPlanAhead'),
    planLongTermNotice(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLongTermNotice'),
  );
};

const addPlanReview = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    undefined,
    i18n.__('decisionMaking.planReview.title'),
    i18n.__('decisionMaking.planReview.childrensNeedsChange'),
    planReview(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planReview'),
  );
};

const addDecisionMaking = (pdf: PdfBuilder, request: Request) => {
  addPlanLastMinuteChanges(pdf, request);
  addPlanLongTermNotice(pdf, request);
  addPlanReview(pdf, request);

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.compromise.decisionMaking'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addDecisionMaking;
