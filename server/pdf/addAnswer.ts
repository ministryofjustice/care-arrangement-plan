import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE, SECTION_HEADING_SIZE } from '../constants/pdfConstants';
import { PerChildFormattedAnswerForPdf } from '../utils/formattedAnswersForPdf';

import DoYouAgreeComponent from './components/doYouAgree';
import SplittableTextComponent from './components/splittableText';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';
import Pdf from './pdf';

// Type guard to check if answer is a per-child answer structure
const isPerChildAnswer = (answer: string | PerChildFormattedAnswerForPdf): answer is PerChildFormattedAnswerForPdf => {
  return typeof answer === 'object' && 'defaultAnswer' in answer;
};

const addAnswer = (
  pdf: Pdf,
  sectionHeading: string | undefined,
  question: string,
  subtext: string | undefined,
  answer: string | PerChildFormattedAnswerForPdf | undefined,
  disagreeText: string,
) => {
  if (!answer) return;

  // Build the paragraphs array
  const paragraphs: Array<{
    text: string;
    size: number;
    style: FontStyles;
    bottomPadding: number;
    splittable?: boolean;
  } | undefined> = [
    sectionHeading
      ? {
          text: sectionHeading,
          size: SECTION_HEADING_SIZE,
          style: FontStyles.BOLD,
          bottomPadding: PARAGRAPH_SPACE,
        }
      : undefined,
    {
      text: question,
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    subtext
      ? {
          text: subtext,
          size: MAIN_TEXT_SIZE,
          style: FontStyles.NORMAL,
          bottomPadding: PARAGRAPH_SPACE,
        }
      : undefined,
  ];

  // Handle per-child answer structure
  if (isPerChildAnswer(answer)) {
    // Add "For all children:" label
    paragraphs.push({
      text: 'For all children:',
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE / 2,
    });

    // Add the default answer
    paragraphs.push({
      text: answer.defaultAnswer,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      splittable: true,
    });

    // Add per-child answers if they exist
    if (answer.perChildAnswers) {
      for (const childAnswer of answer.perChildAnswers) {
        // Add child name label
        paragraphs.push({
          text: `For ${childAnswer.childName}:`,
          size: MAIN_TEXT_SIZE,
          style: FontStyles.BOLD,
          bottomPadding: PARAGRAPH_SPACE / 2,
        });

        // Add the child's answer
        paragraphs.push({
          text: childAnswer.answer,
          size: MAIN_TEXT_SIZE,
          style: FontStyles.NORMAL,
          bottomPadding: PARAGRAPH_SPACE,
          splittable: true,
        });
      }
    }
  } else {
    // Simple string answer
    paragraphs.push({
      text: answer,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      splittable: true,
    });
  }

  new SplittableTextComponent(
    pdf,
    paragraphs.filter((paragraph) => !!paragraph),
  ).addComponentToDocument();

  new DoYouAgreeComponent(pdf, pdf.request.__('sharePlan.yourProposedPlan.doYouAgree')).addComponentToDocument();

  new TextboxComponent(pdf, [
    {
      text: disagreeText,
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addAnswer;
