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
        senderName: request.session.initialAdultName,
      }),
      size: SECTION_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.senderHasUsedThe', {
        senderName: request.session.initialAdultName,
        childrenNames: formattedChildrenNames(request),
      }),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.pleaseReadThrough', {
        senderName: request.session.initialAdultName
      }),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
        {
      text: request.__('sharePlan.whatWeAreTelling.notLegallyBinding'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
      text: request.__('sharePlan.whatWeAreTelling.ifYouDontAgree'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.whatWeAreTelling.useThisForm', {
        senderName: request.session.initialAdultName,
      }),
      request.__('sharePlan.whatWeAreTelling.startYourOwn'),
      request.__('sharePlan.whatWeAreTelling.makeAWrittenAgreement'),
    ],
  }).addComponentToDocument();

    new TextComponent(pdf, [
    {
        text: request.__('sharePlan.whatWeAreTelling.yourSafety'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();


   new BulletListComponent(pdf, {
    initialText: [    {
      text: request.__('sharePlan.whatWeAreTelling.shouldOnlyRespond'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ], 

    bulletText: [
      request.__('sharePlan.whatWeAreTelling.confident'),
      request.__('sharePlan.whatWeAreTelling.doNotFeelPressured'),
    ],
  }).addComponentToDocument();

    new TextComponent(pdf, [
    {
        text: request.__('sharePlan.whatWeAreTelling.stopIfAnyConcern'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.feedbackOrSafetyConcerns'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.cannotAnswerQuestions'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();


    new TextComponent(pdf, [
    {
        text: request.__('sharePlan.whatWeAreTelling.benefitsHeading'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

     new BulletListComponent(pdf, {
    initialText: [    {
      text: request.__('sharePlan.whatWeAreTelling.mightFind', {
        senderName: request.session.initialAdultName,
      }),
      size:  MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ], 

    bulletText: [
      request.__('sharePlan.whatWeAreTelling.takesAround'),
      request.__('sharePlan.whatWeAreTelling.bestOutcome'),
    ],
  }).addComponentToDocument();



  new TextComponent(pdf, [
    {
        text: request.__('sharePlan.whatWeAreTelling.goingToCourt'),
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
        {
        text: request.__('sharePlan.whatWeAreTelling.planShould'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.whatWeAreTelling.welfare'),
      request.__('sharePlan.whatWeAreTelling.wishes'),
      request.__('sharePlan.whatWeAreTelling.considerAnyHarm'),
    ],
  }).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.whatWeAreTelling.ifThereIsCourt'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.whatWeAreTelling.doNotContinue'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.whatWeAreTelling.forExample'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.whatWeAreTelling.childArrangementsOrder'),
      request.__('sharePlan.whatWeAreTelling.specificIssueOrder'),
      request.__('sharePlan.whatWeAreTelling.prohibitedStepsOrder'),
      request.__('sharePlan.whatWeAreTelling.protectiveOrder'),
      request.__('sharePlan.whatWeAreTelling.anyOther'),
    ],
    finalText: [
      {
        text: request.__('sharePlan.whatWeAreTelling.toChange'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
        urlize: true,
      }
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
      request.__('sharePlan.whatWeAreTelling.makingChildArrangements'),
      request.__('sharePlan.whatWeAreTelling.legalSeparation'),
      request.__('sharePlan.whatWeAreTelling.divorce'),
    ],
  }).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.whatWeAreTelling.legalAdviceHeading'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.findLegalAdviser'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
  ]).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.whatWeAreTelling.domesticAbuseHeading'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.signsAndEffects'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
        {
      text: request.__('sharePlan.whatWeAreTelling.unsureVictim'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
  ]).addComponentToDocument();

    new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.whatWeAreTelling.notSuitableHeading'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.whatWeAreTelling.anyForm'),
      request.__('sharePlan.whatWeAreTelling.childAbduction'),
      request.__('sharePlan.whatWeAreTelling.childAbuse'),
      request.__('sharePlan.whatWeAreTelling.drugsOrAlcohol'),
      request.__('sharePlan.whatWeAreTelling.anyOtherSafety'),
    ],
  }).addComponentToDocument();

    new TextComponent(pdf, [
    {
      text: request.__('sharePlan.whatWeAreTelling.feedbackHeading'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.toAskForHelp'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
    {
      text: request.__('sharePlan.whatWeAreTelling.weCannot'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
  ]).addComponentToDocument();

  
};

export default addPreamble;
