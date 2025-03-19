import { Request } from 'express';
import i18n from 'i18n';

import { PdfBuilder } from '../@types/pdf';
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE } from '../constants/pdfConstants';
import { planLastMinuteChanges as planLastMinuteChanges } from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';

const addPlanLastMinuteChanges = (pdf: PdfBuilder, request: Request) => {
  addAnswer(
    pdf,
    i18n.__('taskList.decisionMaking'),
    i18n.__('decisionMaking.planLastMinuteChanges.howChangesCommunicated'),
    undefined,
    planLastMinuteChanges(request.session),
    i18n.__('sharePlan.yourProposedPlan.doNotAgree.decisionMaking.planLastMinuteChanges'),
  );
};

const addDecisionMaking = (pdf: PdfBuilder, request: Request) => {
  addPlanLastMinuteChanges(pdf, request);

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
