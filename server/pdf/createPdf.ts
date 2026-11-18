import { Request } from 'express';

import addAboutTheProposal from './addAboutTheProposal';
import addDecisionMaking from './addDecisionMaking';
import addEducation from './addEducation';
import addHandoverAndHolidays from './addHandoverAndHolidays';
import addHealth from './addHealth';
import addLivingAndVisiting from './addLivingAndVisiting';
import addOtherThings from './addOtherThings';
import addPreamble from './addPreamble';
import addSpecialDays from './addSpecialDays';
import addWhatHappensNow from './addWhatHappensNow';
import Pdf from './pdf';

const createPdf = (autoPrint: boolean, request: Request) => {
  const pdf = new Pdf(autoPrint, request);
  pdf.addRecipientDocumentLabel();

  addPreamble(pdf);
  pdf.createNewPage();

  addAboutTheProposal(pdf);
  addLivingAndVisiting(pdf);
  addHandoverAndHolidays(pdf);
  addHealth(pdf);
  addEducation(pdf);
  addSpecialDays(pdf);
  addOtherThings(pdf);
  addDecisionMaking(pdf);
  addWhatHappensNow(pdf);

  pdf.addFooterToEveryPage();

  return pdf.toArrayBuffer();
};

export default createPdf;
