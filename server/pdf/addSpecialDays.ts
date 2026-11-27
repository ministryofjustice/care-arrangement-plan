import { whatWillHappen } from '../utils/formattedAnswersForPdf';

import addAnswer from './addAnswer';
import Pdf from './pdf';

const addSpecialDays = (pdf: Pdf) => {
  const request = pdf.request;
  addAnswer(
    pdf,
    request.__('sharePlan.specialDays.sectionTitle'),
    request.__('sharePlan.specialDays.title'),
    request.__('sharePlan.specialDays.whatWillHappen.title'),
    request.__('sharePlan.specialDays.whatWillHappen.content'),
    whatWillHappen(request),
    request.__('sharePlan.yourProposedPlan.doNotAgree.specialDays.whatWillHappen'),
  );
};

export default addSpecialDays;
