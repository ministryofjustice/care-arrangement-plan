import i18n from 'i18n'
import { Request } from 'express'
import Pdf from './pdf'
import TextComponent from './components/text'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, QUESTION_TITLE_SIZE, SECTION_HEADING_SIZE } from '../constants/pdfConstants'
import BulletListComponent from './components/bulletList'

const createPdf = (autoPrint: boolean, request: Request) => {
  const pdf = new Pdf(autoPrint)

  new TextComponent(pdf, [
    {
      text: i18n.__('sharePlan.whatWeAreTelling.proposedPlan', {
        childrenNames: request.sessionHelpers.formattedChildrenNames(),
      }),
      size: SECTION_HEADING_SIZE,
      style: 'bold',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.whatWeAreTelling.initialIsAsking', {
        senderName: request.session.initialAdultName,
        childrenNames: request.sessionHelpers.formattedChildrenNames(),
      }),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
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
        style: 'normal',
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
      style: 'bold',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.whatWeAreTelling.benefits', { senderName: request.session.initialAdultName }),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: i18n.__('sharePlan.whatWeAreTelling.topTips'),
        size: QUESTION_TITLE_SIZE,
        style: 'bold',
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
        style: 'bold',
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.moreInfo'),
        size: MAIN_TEXT_SIZE,
        style: 'normal',
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
        style: 'bold',
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.safetyCheck'),
        size: MAIN_TEXT_SIZE,
        style: 'normal',
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.doNotContinueIf'),
        size: MAIN_TEXT_SIZE,
        style: 'normal',
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
        style: 'bold',
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
  }).addComponentToDocument()

  new TextComponent(pdf, [
    {
      text: i18n.__('sharePlan.whatWeAreTelling.gettingHelpHeading'),
      size: QUESTION_TITLE_SIZE,
      style: 'bold',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.whatWeAreTelling.gettingHelp'),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()

  if (request.session.courtOrderInPlace) {
    new BulletListComponent(pdf, {
      initialText: [
        {
          text: i18n.__('sharePlan.whatWeAreTelling.courtOrderHeading'),
          size: QUESTION_TITLE_SIZE,
          style: 'bold',
          bottomPadding: PARAGRAPH_SPACE,
        },
        {
          text: i18n.__('sharePlan.whatWeAreTelling.courtOrderInPlace', {
            senderName: request.session.initialAdultName,
          }),
          size: MAIN_TEXT_SIZE,
          style: 'normal',
          bottomPadding: PARAGRAPH_SPACE,
        },
        {
          text: i18n.__('sharePlan.whatWeAreTelling.ordersInclude'),
          size: MAIN_TEXT_SIZE,
          style: 'normal',
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
          style: 'normal',
          bottomPadding: PARAGRAPH_SPACE,
        },
        {
          text: i18n.__('sharePlan.whatWeAreTelling.stopIfOrders'),
          size: MAIN_TEXT_SIZE,
          style: 'bold',
          bottomPadding: PARAGRAPH_SPACE,
        },
      ],
    }).addComponentToDocument()
    new TextComponent(pdf, [
      {
        text: i18n.__('sharePlan.whatWeAreTelling.noRestrictionsOnContactHeading'),
        size: QUESTION_TITLE_SIZE,
        style: 'bold',
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.noRestrictionsOnContact'),
        size: MAIN_TEXT_SIZE,
        style: 'normal',
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.whatWeAreTelling.changeCourtArrangements'),
        size: MAIN_TEXT_SIZE,
        style: 'normal',
        bottomPadding: PARAGRAPH_SPACE,
      },
    ]).addComponentToDocument()
  }

  pdf.createNewPage()

  pdf.createDoYouAgreeComponent(
    'About this child arrangements proposal',
    undefined,
    'Lara said:\n•   there is no court order in place at this time\n•   this is a proposed child arrangements plan for 2 children, Annie and Billy\n•   this agreement is between Lara and Ian, who are the adults who will care for Annie and Billy',
    'We do not store these names or share any of this information with other government departments.',
    false,
  )
  pdf.createDoYouAgreeComponent(
    'Living and visiting',
    'Where will the children mostly live?',
    "Lara has suggested that the children mostly live at Lara's home.",
    'If you do not agree, suggest where the children will mostly live',
    true,
  )
  pdf.createDoYouAgreeComponent(
    undefined,
    'Will the children stay overnight with Ian?',
    'Lara has suggested that the children stay overnight with Ian every week.',
    'If you do not agree, suggest what should happen about overnight visits',
    true,
  )
  pdf.createDoYouAgreeComponent(
    undefined,
    'Will the children stay overnight with Ian?',
    'Lara has suggested that the children stay overnight with Ian every week.',
    'If you do not agree, suggest what should happen about overnight visits',
    true,
  )
  pdf.addFooterToEveryPage()

  return pdf.toArrayBuffer()
}

export default createPdf
