import { Request } from 'express';

import { resetQuestionCounter, resetTextboxCounter } from './addAnswer';
import addDecisionMaking from './addDecisionMaking';
import addHandoverAndHolidays from './addHandoverAndHolidays';
import addLivingAndVisiting from './addLivingAndVisiting';
import addOtherThings from './addOtherThings';
import addSpecialDays from './addSpecialDays';
import addWhatHappensNow from './addWhatHappensNow';

const createHtmlContent = (request: Request): string => {
  // Reset counters for each export
  resetQuestionCounter();
  resetTextboxCounter();

  let html = '';

  // Add all sections
  html += addLivingAndVisiting(request);
  html += addHandoverAndHolidays(request);
  html += addSpecialDays(request);
  html += addOtherThings(request);
  html += addDecisionMaking(request);
  html += addWhatHappensNow(request);

  return html;
};

export default createHtmlContent;
