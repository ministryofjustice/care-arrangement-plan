import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE } from '../constants/pdfConstants';
import { whatWillHappen } from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';
import Pdf from './pdf';

const addSpecialDays = (pdf: Pdf) => {
  const request = pdf.request;
  addAnswer(
    pdf,
    request.__('taskList.specialDays'),
    request.__('specialDays.whatWillHappen.title'),
    request.__('specialDays.whatWillHappen.content'),
    whatWillHappen(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.specialDays.whatWillHappen'),
  );

  new TextboxComponent(pdf, [
    {
      text: request.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.compromise.specialDays'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addSpecialDays;
