import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, SECTION_HEADING_SIZE } from '../constants/pdfConstants';

import TextComponent from './components/text';
import FontStyles from './fontStyles';
import Pdf from './pdf';

const addWhatHappensNow = (pdf: Pdf) => {
  const request = pdf.request;
  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.yourProposedPlan.whatHappensNowHeading'),
      size: SECTION_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.nowSendPlan', { senderName: request.session.initialAdultName }),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.notLegallyBinding'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.unableToAgree'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.moreInfoAndSupport'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.helpUsImprove'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
  ]).addComponentToDocument();
};

export default addWhatHappensNow;
