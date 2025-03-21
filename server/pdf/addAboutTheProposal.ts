import { Request } from 'express';
import i18n from 'i18n';

import { PdfBuilder } from '../@types/pdf';
import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, SECTION_HEADING_SIZE } from '../constants/pdfConstants';
import { formattedChildrenNames } from '../utils/sessionHelpers';

import BulletListComponent from './components/bulletList';
import DoYouAgreeComponent from './components/doYouAgree';
import TextComponent from './components/text';
import FontStyles from './fontStyles';

const addAboutTheProposal = (pdf: PdfBuilder, request: Request) => {
  const { initialAdultName, secondaryAdultName, numberOfChildren } = request.session;
  const childrenNames = formattedChildrenNames(request.session);

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: i18n.__('sharePlan.yourProposedPlan.aboutThePlan'),
        size: SECTION_HEADING_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: i18n.__('sharePlan.yourProposedPlan.senderSaid', { senderName: initialAdultName }),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      i18n.__('sharePlan.yourProposedPlan.noCourtOrder'),
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
  }).addComponentToDocument();

  new DoYouAgreeComponent(
    pdf,
    i18n.__('sharePlan.yourProposedPlan.doYouAgreeOnBasics', { senderName: initialAdultName }),
  ).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: i18n.__('sharePlan.yourProposedPlan.doNotStoreNames'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: i18n.__('sharePlan.yourProposedPlan.doNotAgreeOnBasics'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
  ]).addComponentToDocument();
};

export default addAboutTheProposal;
