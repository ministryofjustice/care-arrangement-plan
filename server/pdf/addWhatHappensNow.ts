import { TextRun } from '../@types/pdf';
import { MAIN_TEXT_SIZE, NO_SPACE, PARAGRAPH_SPACE, SUB_HEADING_SIZE } from '../constants/pdfConstants';

import SignatureFields from './components/signatureFields';
import TextComponent from './components/text';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';
import Pdf from './pdf';

const sentenceSegments = (text: string, boldSentence: 'first' | 'second'): TextRun[] => {
  const sentenceEnd = text.indexOf('. ');
  if (sentenceEnd === -1) {
    return [{ text, style: boldSentence === 'first' ? FontStyles.BOLD : FontStyles.NORMAL }];
  }

  const leadStyle = boldSentence === 'first' ? FontStyles.BOLD : FontStyles.NORMAL;
  const restStyle = boldSentence === 'second' ? FontStyles.BOLD : FontStyles.NORMAL;

  return [
    { text: text.slice(0, sentenceEnd + 1), style: leadStyle },
    { text: text.slice(sentenceEnd + 1), style: restStyle },
  ];
};

const addWhatHappensNow = (pdf: Pdf) => {
  const request = pdf.request;
  const legallyBinding = request.__('sharePlan.endOfForm.whatToDoNext.legallyBinding');
  const signBelow = request.__('sharePlan.endOfForm.jointAgreement.signBelowToConfirm');
  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.endOfForm.sectionTitle'),
      size: SUB_HEADING_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.title'),
      size: SUB_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.subtitle'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  new TextboxComponent(
    pdf,
    [
      {
        text: request.__('sharePlan.endOfForm.otherInformationLabel'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    120,
  ).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.endOfForm.jointAgreement.title'),
      size: SUB_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: NO_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.jointAgreement.intro'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: signBelow,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      segments: sentenceSegments(signBelow, 'second'),
    },
    {
      text: request.__('sharePlan.endOfForm.jointAgreement.declarationText'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.ITALIC,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  new SignatureFields(pdf).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.endOfForm.jointAgreement.legalStatus.title'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: NO_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.jointAgreement.legalStatus.intro'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.jointAgreement.legalStatus.legallyBinding'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.whatToDoNext.title'),
      size: SUB_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.whatToDoNext.intro'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: legallyBinding,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      segments: sentenceSegments(legallyBinding, 'first'),
    },
    {
      text: request.__('sharePlan.endOfForm.whatToDoNext.cannotReachAnAgreement.title'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: NO_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.whatToDoNext.cannotReachAnAgreement.intro'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.whatToDoNext.cannotReachAnAgreement.moreInfo'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.whatToDoNext.feedback.title'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: NO_SPACE,
    },
    {
      text: request.__('sharePlan.endOfForm.whatToDoNext.feedback.intro'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
  ]).addComponentToDocument();
};

export default addWhatHappensNow;
