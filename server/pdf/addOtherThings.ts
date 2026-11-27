import {
  MAIN_TEXT_SIZE,
  NO_SPACE,
  PARAGRAPH_SPACE,
  QUESTION_TITLE_SIZE,
  SECTION_HEADING_SIZE
} from '../constants/pdfConstants';
import { whatOtherThingsMatter } from '../utils/formattedAnswersForPdf';

import BulletListComponent from './components/bulletList';
import DoYouAgreeComponent from './components/doYouAgree';
import SplittableTextComponent from './components/splittableText';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';
import Pdf from './pdf';

const addOtherThings = (pdf: Pdf) => {
  const request = pdf.request;
  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.otherThings.sectionTitle'),
        size: SECTION_HEADING_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: NO_SPACE,
      },
      {
        text: request.__('sharePlan.otherThings.title'),
        size: SECTION_HEADING_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.otherThings.whatOtherThingsMatter.title'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.otherThings.whatOtherThingsMatter.thingsToAgree'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.otherThings.whatOtherThingsMatter.religionDietAndRules'),
      request.__('sharePlan.otherThings.whatOtherThingsMatter.extraCurriculars'),
      request.__('sharePlan.otherThings.whatOtherThingsMatter.friendsAndFamily'),
      request.__('sharePlan.otherThings.whatOtherThingsMatter.otherContact'),
    ],
  }).addComponentToDocument();

  new SplittableTextComponent(pdf, [
    {
      text: whatOtherThingsMatter(request),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      splittable: true,
    },
  ]).addComponentToDocument();

  new DoYouAgreeComponent(pdf, request.__('sharePlan.yourProposedPlan.doYouAgree')).addComponentToDocument();

  new TextboxComponent(pdf, [
    {
      text: request.__('sharePlan.yourProposedPlan.doNotAgree.otherThings.whatOtherThingsMatter'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addOtherThings;
