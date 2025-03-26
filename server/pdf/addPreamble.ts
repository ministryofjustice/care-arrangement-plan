import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE, SECTION_HEADING_SIZE } from '../constants/pdfConstants';
import { formattedChildrenNames } from '../utils/sessionHelpers';

import BulletListComponent from './components/bulletList';
import TextComponent from './components/text';
import FontStyles from './fontStyles';
import Pdf from './pdf';

const addPreamble = (pdf: Pdf) => {
  const request = pdf.request;
  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.whatWeAreTelling.proposedPlan', {
        childrenNames: formattedChildrenNames(request.session),
      }),
      size: SECTION_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.initialIsAsking', {
        senderName: request.session.initialAdultName,
        childrenNames: formattedChildrenNames(request.session),
      }),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.whatWeAreTelling.doNotNeedToAccept', {
          senderName: request.session.initialAdultName,
        }),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.whatWeAreTelling.suggestChanges', {
        senderName: request.session.initialAdultName,
      }),
      request.__('sharePlan.whatWeAreTelling.startYourOwn'),
      request.__('sharePlan.whatWeAreTelling.suggestChanges'),
    ],
  }).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.whatWeAreTelling.benefitsHeading'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.benefits', { senderName: request.session.initialAdultName }),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.whatWeAreTelling.topTips'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.whatWeAreTelling.compromise', {
        senderName: request.session.initialAdultName,
      }),
      request.__('sharePlan.whatWeAreTelling.childrensInput'),
      request.__('sharePlan.whatWeAreTelling.childrenFirst'),
      request.__('sharePlan.whatWeAreTelling.splitMayNotBeBest'),
    ],
  }).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.whatWeAreTelling.moreInfoHeading'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.whatWeAreTelling.moreInfo'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.whatWeAreTelling.separatingOrDivorcing'),
      request.__('sharePlan.whatWeAreTelling.makingChildArrangements'),
    ],
  }).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.whatWeAreTelling.safetyCheckHeading'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.whatWeAreTelling.safetyCheck'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.whatWeAreTelling.doNotContinueIf'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('childrenSafetyCheck.domesticAbuse'),
      request.__('childrenSafetyCheck.childAbduction'),
      request.__('childrenSafetyCheck.childAbuse'),
      request.__('childrenSafetyCheck.drugsOrAlcohol'),
      request.__('childrenSafetyCheck.otherConcerns'),
    ],
    finalText: [
      {
        text: request.__('sharePlan.whatWeAreTelling.stopIfAnyConcern'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
  }).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.whatWeAreTelling.gettingHelpHeading'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.gettingHelp'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.whatWeAreTelling.courtOrderHeading'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.ifCourtOrderInIsPlace'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addPreamble;
