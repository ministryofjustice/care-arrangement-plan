import { Request } from 'express';

const addPaidFeedback = (request: Request): string => {
  return `<section id="paid-feedback" aria-labelledby="paid-feedback-heading">
    <h3 id="paid-feedback-heading">${request.__('pdf.paidFeedback.title')}</h3>
    <p>${request.__('pdf.paidFeedback.helpToImprove')}</p>
    <p>
      <b>
        ${request.__('pdf.paidFeedback.signUp')}&nbsp;<a href="${request.__('pdf.paidFeedback.signUpLink')}">${request.__('pdf.paidFeedback.signUpLink')}</a>
      </b>
    </p>
    </section>\n\n`;
};

export default addPaidFeedback;
