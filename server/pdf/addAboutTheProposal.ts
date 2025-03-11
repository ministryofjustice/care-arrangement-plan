import i18n from 'i18n'
import { Request } from 'express'
import { PdfBuilder } from '../@types/pdf'
import DoYouAgreeComponent from './components/doYouAgree'
import BulletListComponent from './components/bulletList'
import TextComponent from './components/text'
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, SECTION_HEADING_SIZE } from '../constants/pdfConstants'

const addAboutTheProposal = (pdf: PdfBuilder, request: Request) => {
  const { initialAdultName, courtOrderInPlace, secondaryAdultName, numberOfChildren } = request.session
  const childrenNames = request.sessionHelpers.formattedChildrenNames()

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: i18n.__('sharePlan.yourProposedPlan.aboutThePlan'),
        size: SECTION_HEADING_SIZE,
        style: 'bold',
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.yourProposedPlan.senderSaid', { senderName: initialAdultName }),
        size: MAIN_TEXT_SIZE,
        style: 'normal',
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      courtOrderInPlace
        ? i18n.__('sharePlan.yourProposedPlan.courtOrder')
        : i18n.__('sharePlan.yourProposedPlan.noCourtOrder'),
      numberOfChildren === 1
        ? i18n.__('sharePlan.yourProposedPlan.forOneChild', { childName: childrenNames })
        : i18n.__('sharePlan.yourProposedPlan.forMultipleChildren', {
            childrenNames,
            numberOfChildren: numberOfChildren.toString(),
          }),
      i18n.__('sharePlan.yourProposedPlan.agreementBetween', {
        senderName: initialAdultName,
        otherAdultName: secondaryAdultName,
        childrenNames,
      }),
    ],
  }).addComponentToDocument()

  new DoYouAgreeComponent(
    pdf,
    i18n.__('sharePlan.yourProposedPlan.doYouAgreeOnBasics', { senderName: initialAdultName }),
  ).addComponentToDocument()

  new TextComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.doNotStoreNames'),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.doNotAgreeOnBasics'),
      size: MAIN_TEXT_SIZE,
      style: 'normal',
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument()
}

export default addAboutTheProposal
