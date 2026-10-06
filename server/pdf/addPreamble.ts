import {
  ADDITIONAL_SUB_HEADING_SIZE,
  HEADING_SIZE,
  MAIN_TEXT_SIZE,
  NO_SPACE,
  PARAGRAPH_SPACE,
  SUB_HEADING_SIZE
} from '../constants/pdfConstants';
import { formattedChildrenNames } from '../utils/sessionHelpers';

import BulletListComponent from './components/bulletList';
import ShadedTextComponent from './components/shadedText';
import TextComponent from './components/text';
import FontStyles from './fontStyles';
import Pdf from './pdf';

const addPreamble = (pdf: Pdf) => {
  const request = pdf.request;
  pdf.reserveSupportColumn();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.name'),
      size: HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  const supportBoxTop = pdf.currentY;
  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.beforeYouStart.title'),
      size: SUB_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  const supportBoxBottom = pdf.addSupportBox(
    request.__('sharePlan.contact'),
    request.__('sharePlan.unableToAssist'),
    supportBoxTop,
  );

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.beforeYouStart.alert'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
      inset: true,
    },
  ]).addComponentToDocument();

  new BulletListComponent(pdf, {
    bulletText: [
      {
        bold: request.__('sharePlan.beforeYouStart.options.voluntary.title'),
        text: request.__('sharePlan.beforeYouStart.options.voluntary.text'),
      },
      {
        bold: request.__('sharePlan.beforeYouStart.options.legalDocument.title'),
        text: request.__('sharePlan.beforeYouStart.options.legalDocument.text'),
      },
      {
        bold: request.__('sharePlan.beforeYouStart.options.informalAgreements.title'),
        text: request.__('sharePlan.beforeYouStart.options.informalAgreements.text'),
      },
      {
        bold: request.__('sharePlan.beforeYouStart.options.courtOrder.title'),
        text: request.__('sharePlan.beforeYouStart.options.courtOrder.text'),
      },
    ],
  }).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.beforeYouStart.startYourOwnPlan'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  pdf.restoreContentWidth();
  if (pdf.currentY < supportBoxBottom + PARAGRAPH_SPACE) {
    pdf.currentY = supportBoxBottom + PARAGRAPH_SPACE;
  }

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.beforeYouStart.getMoreInfo.title'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: NO_SPACE,
    },
  ]).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.beforeYouStart.getMoreInfo.intro'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: NO_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.beforeYouStart.getMoreInfo.options.makingChildArrangements'),
      request.__('sharePlan.beforeYouStart.getMoreInfo.options.findWays'),
      request.__('sharePlan.beforeYouStart.getMoreInfo.options.childMaintenanceService'),
    ],
  }).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.beforeYouStart.useThisDocument'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.beforeYouStart.howToRespond.title'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: NO_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.beforeYouStart.howToRespond.options.suggestedPlan'),
      request.__('sharePlan.beforeYouStart.howToRespond.options.markYourChoice'),
      request.__('sharePlan.beforeYouStart.howToRespond.options.addYourComments'),
      request.__('sharePlan.beforeYouStart.howToRespond.options.completedDocument'),
    ],
  }).addComponentToDocument();

  pdf.createNewPage();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.suggested.title', {
        senderName: request.session.initialAdultName,
      }),
      size: ADDITIONAL_SUB_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: NO_SPACE,
    },
    {
      text: request.__('sharePlan.suggested.intro', {
        senderName: request.session.initialAdultName,
        childrenNames: formattedChildrenNames(request),
      }),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.suggested.howPlanCanHelp.title'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: NO_SPACE,
    },
  ]).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.suggested.howPlanCanHelp.intro', {
          senderName: request.session.initialAdultName,
        }),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: NO_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.suggested.howPlanCanHelp.options.cheaperAndQuicker'),
      request.__('sharePlan.suggested.howPlanCanHelp.options.betterOutcome'),
    ],
  }).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.suggested.yourPlanShould.title'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: NO_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.suggested.yourPlanShould.options.welfareFirst'),
      request.__('sharePlan.suggested.yourPlanShould.options.reflectTheWishes'),
    ],
  }).addComponentToDocument();

  new ShadedTextComponent(pdf, [
    {
      text: request.__('sharePlan.yourSafety.title'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: NO_SPACE,
    },
    {
      text: request.__('sharePlan.yourSafety.intro'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourSafety.concerns'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourSafety.feedback'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: NO_SPACE,
    },
  ]).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.decideNotToRespond.title'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: NO_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.decideNotToRespond.options.noNegativeConsequences'),
      request.__('sharePlan.decideNotToRespond.options.noCourtImpact'),
      request.__('sharePlan.decideNotToRespond.options.noInformationSharing'),
    ],
  }).addComponentToDocument();

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.gettingHelpFindingChildArrangementOptions.title'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: NO_SPACE,
      },
      {
        text: request.__('sharePlan.gettingHelpFindingChildArrangementOptions.intro'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.gettingHelpFindingChildArrangementOptions.independentFamilyMediator'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.gettingHelpFindingChildArrangementOptions.notSuitable.title'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: NO_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.gettingHelpFindingChildArrangementOptions.notSuitable.options.domesticAbuse'),
      request.__('sharePlan.gettingHelpFindingChildArrangementOptions.notSuitable.options.childAbduction'),
      request.__('sharePlan.gettingHelpFindingChildArrangementOptions.notSuitable.options.childAbuse'),
      request.__('sharePlan.gettingHelpFindingChildArrangementOptions.notSuitable.options.substanceMisuse'),
      request.__('sharePlan.gettingHelpFindingChildArrangementOptions.notSuitable.options.otherConcerns'),
    ],
  }).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.gettingHelpDomesticAbuse.title'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: NO_SPACE,
    },
    {
      text: request.__('sharePlan.gettingHelpDomesticAbuse.intro'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.gettingHelpDomesticAbuse.experiencedAbuse'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addPreamble;
