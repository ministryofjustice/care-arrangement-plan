import i18n from 'i18n'
import { Request } from 'express'
import { PdfBuilder } from '../@types/pdf'
import TextComponent from './components/text'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE, SECTION_HEADING_SIZE } from '../constants/pdfConstants'
import BulletListComponent from './components/bulletList'
import { formattedChildrenNames } from '../utils/sessionHelpers'
import FontStyles from './fontStyles'

const addPreamble = (pdf: PdfBuilder, request: Request) => {
  new TextComponent(pdf, [
    {
      text: i18n.__('sharePlan.whatWeAreTelling.proposedPlan', {
        childrenNames: formattedChildrenNames(request.session),
      }),
      size: SECTION_HEADING_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.whatWeAreTelling.initialIsAsking', {
        senderName: request.session.initialAdultName,
        childrenNames: formattedChildrenNames(request.session),
      }),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: i18n.__('sharePlan.whatWeAreTelling.doNotNeedToAccept', {
          senderName: request.session.initialAdultName,
        }),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      i18n.__('sharePlan.whatWeAreTelling.suggestChanges', {
        senderName: request.session.initialAdultName,
      }),
      i18n.__('sharePlan.whatWeAreTelling.startYourOwn'),
      i18n.__('sharePlan.whatWeAreTelling.suggestChanges'),
    ],
  }).addComponentToDocument()

  new TextComponent(pdf, [
    {
      text: i18n.__('sharePlan.whatWeAreTelling.benefitsHeading'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.whatWeAreTelling.benefits', { senderName: request.session.initialAdultName }),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: i18n.__('sharePlan.whatWeAreTelling.topTips'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      i18n.__('sharePlan.whatWeAreTelling.compromise', {
        senderName: request.session.initialAdultName,
      }),
      i18n.__('sharePlan.whatWeAreTelling.childrensInput'),
      i18n.__('sharePlan.whatWeAreTelling.childrenFirst'),
      i18n.__('sharePlan.whatWeAreTelling.splitMayNotBeBest'),
    ],
  }).addComponentToDocument()

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: i18n.__('sharePlan.whatWeAreTelling.moreInfoHeading'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.moreInfo'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      i18n.__('sharePlan.whatWeAreTelling.separatingOrDivorcing'),
      i18n.__('sharePlan.whatWeAreTelling.makingChildArrangements'),
    ],
  }).addComponentToDocument()

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: i18n.__('sharePlan.whatWeAreTelling.safetyCheckHeading'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.safetyCheck'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.doNotContinueIf'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      i18n.__('sharePlan.whatWeAreTelling.domesticAbuse'),
      i18n.__('sharePlan.whatWeAreTelling.childAbduction'),
      i18n.__('sharePlan.whatWeAreTelling.childAbuse'),
      i18n.__('sharePlan.whatWeAreTelling.drugsOrAlcohol'),
      i18n.__('sharePlan.whatWeAreTelling.otherConcerns'),
    ],
    finalText: [
      {
        text: i18n.__('sharePlan.whatWeAreTelling.stopIfAnyConcern'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
  }).addComponentToDocument()

  new TextComponent(pdf, [
    {
      text: i18n.__('sharePlan.whatWeAreTelling.gettingHelpHeading'),
      size: QUESTION_TITLE_SIZE,
      style: FontStyles.BOLD,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.whatWeAreTelling.gettingHelp'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  if (request.session.courtOrderInPlace) {
    new BulletListComponent(pdf, {
      initialText: [
        {
          text: i18n.__('sharePlan.whatWeAreTelling.courtOrderHeading'),
          size: QUESTION_TITLE_SIZE,
          style: FontStyles.BOLD,
          bottomPadding: PARAGRAPH_SPACE,
        },
        {
          text: i18n.__('sharePlan.whatWeAreTelling.courtOrderInPlace', {
            senderName: request.session.initialAdultName,
          }),
          size: MAIN_TEXT_SIZE,
          style: FontStyles.NORMAL,
          bottomPadding: PARAGRAPH_SPACE,
        },
        {
          text: i18n.__('sharePlan.whatWeAreTelling.ordersInclude'),
          size: MAIN_TEXT_SIZE,
          style: FontStyles.NORMAL,
          bottomPadding: PARAGRAPH_SPACE,
        },
      ],
      bulletText: [
        i18n.__('sharePlan.whatWeAreTelling.prohibitedSteps'),
        i18n.__('sharePlan.whatWeAreTelling.specificIssue'),
        i18n.__('sharePlan.whatWeAreTelling.nonMolestation'),
        i18n.__('sharePlan.whatWeAreTelling.noContact'),
      ],
      finalText: [
        {
          text: i18n.__('sharePlan.whatWeAreTelling.checkDocuments'),
          size: MAIN_TEXT_SIZE,
          style: FontStyles.NORMAL,
          bottomPadding: PARAGRAPH_SPACE,
        },
        {
          text: i18n.__('sharePlan.whatWeAreTelling.stopIfOrders'),
          size: MAIN_TEXT_SIZE,
          style: FontStyles.BOLD,
          bottomPadding: PARAGRAPH_SPACE,
        },
      ],
    }).addComponentToDocument()
    new TextComponent(pdf, [
      {
        text: i18n.__('sharePlan.whatWeAreTelling.noRestrictionsOnContactHeading'),
        size: QUESTION_TITLE_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.noRestrictionsOnContact'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.changeCourtArrangements'),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ]).addComponentToDocument()
  }
}

export default addPreamble
