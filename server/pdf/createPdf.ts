import { Request } from 'express';

import addAboutTheProposal from './addAboutTheProposal';
import addHandoverAndHolidays from './addHandoverAndHolidays';
import addLivingAndVisiting from './addLivingAndVisiting';
import addPreamble from './addPreamble';
import addSpecialDays from './addSpecialDays';
import addWhatHappensNow from './addWhatHappensNow';
import Pdf from './pdf';

const createPdf = (autoPrint: boolean, request: Request) => {
  const pdf = new Pdf(autoPrint);

  addPreamble(pdf, request);
  pdf.createNewPage();

  addAboutTheProposal(pdf, request);
  addLivingAndVisiting(pdf, request);
  addHandoverAndHolidays(pdf, request);
  addSpecialDays(pdf, request);
  addWhatHappensNow(pdf, request);

  pdf.addFooterToEveryPage();

  return pdf.toArrayBuffer();
};

export default createPdf;
