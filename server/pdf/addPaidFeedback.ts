import {
  ADDITIONAL_SUB_HEADING_SIZE,
  MAIN_TEXT_SIZE,
  PARAGRAPH_SPACE
} from '../constants/pdfConstants';

import TextComponent from './components/text';
import FontStyles from './fontStyles';
import Pdf from './pdf';

const addPaidFeedback = (pdf: Pdf) => {
  const request = pdf.request;
  new TextComponent(pdf, [
    {
      text: request.__('pdf.paidFeedback.title'),
      size: ADDITIONAL_SUB_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('pdf.paidFeedback.helpToImprove'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: `${request.__('pdf.paidFeedback.signUp')} ${request.__('pdf.paidFeedback.signUpLink')}`,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
  ]).addComponentToDocument();
};

export default addPaidFeedback;
