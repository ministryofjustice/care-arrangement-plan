import { Request } from 'express';
import i18n from 'i18n';

import { PdfBuilder } from '../@types/pdf';
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE, SECTION_HEADING_SIZE } from '../constants/pdfConstants';
import { whatOtherThingsMatter } from '../utils/formattedAnswersForPdf';

import BulletListComponent from './components/bulletList';
import DoYouAgreeComponent from './components/doYouAgree';
import TextboxComponent from './components/textbox';
import FontStyles from './fontStyles';

const addOtherThings = (pdf: PdfBuilder, request: Request) => {
  new BulletListComponent(pdf, {
    initialText: [
      {
        text: i18n.__('taskList.otherThings'),
        size: SECTION_HEADING_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('otherThings.whatOtherThingsMatter.title'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('otherThings.whatOtherThingsMatter.thingsToAgree'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      i18n.__('otherThings.whatOtherThingsMatter.religionDietAndRules'),
      i18n.__('otherThings.whatOtherThingsMatter.extraCurriculars'),
      i18n.__('otherThings.whatOtherThingsMatter.friendsAndFamily'),
      i18n.__('otherThings.whatOtherThingsMatter.otherContact'),
    ],
    finalText: [
      {
        text: whatOtherThingsMatter(request.session),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
  }).addComponentToDocument();

  new DoYouAgreeComponent(
    pdf,
    i18n.__('sharePlan.yourProposedPlan.doYouAgreeOnBasics', { senderName: request.session.initialAdultName }),
  ).addComponentToDocument();

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.doNotAgree.otherThings.whatOtherThingsMatter'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  new TextboxComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.endOfSection'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.compromise.otherThings'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addOtherThings;
