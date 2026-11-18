import { whatWillHappen } from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addSpecialDays = (pdf: Pdf) => {
  const request = pdf.request;
  addAnswer(
    pdf,
    undefined,
    request.__('taskList.specialDays'),
    request.__('specialDays.whatWillHappen.title'),
    request.__('specialDays.whatWillHappen.content'),
    whatWillHappen(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.specialDays.whatWillHappen'),
  );
};

export default addSpecialDays;
