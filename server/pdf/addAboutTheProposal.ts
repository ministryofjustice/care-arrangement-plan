import { MAIN_TEXT_SIZE, PARAGRAPH_SPACE, SECTION_HEADING_SIZE } from '../constants/pdfConstants';
import { formattedChildrenNames } from '../utils/sessionHelpers';

import BulletListComponent from './components/bulletList';
import DoYouAgreeComponent from './components/doYouAgree';
import TextComponent from './components/text';
import FontStyles from './fontStyles';
import Pdf from './pdf';

const addAboutTheProposal = (pdf: Pdf) => {
  const request = pdf.request;
  const { initialAdultName, secondaryAdultName, numberOfChildren } = request.session;
  const childrenNames = formattedChildrenNames(request.session);

  new BulletListComponent(pdf, {
    initialText: [
      {
        text: request.__('sharePlan.yourProposedPlan.aboutThePlan'),
        size: SECTION_HEADING_SIZE,
        style: FontStyles.BOLD,
        bottomPadding: PARAGRAPH_SPACE,
      },
      {
        text: request.__('sharePlan.yourProposedPlan.senderSaid', { senderName: initialAdultName }),
        size: MAIN_TEXT_SIZE,
        style: FontStyles.NORMAL,
        bottomPadding: PARAGRAPH_SPACE,
      },
    ],
    bulletText: [
      request.__('sharePlan.yourProposedPlan.noCourtOrder'),
      numberOfChildren === 1
        ? request.__('sharePlan.yourProposedPlan.forOneChild', { childName: childrenNames })
        : request.__('sharePlan.yourProposedPlan.forMultipleChildren', {
            childrenNames,
            numberOfChildren: numberOfChildren.toString(),
          }),
      request.__('sharePlan.yourProposedPlan.agreementBetween', {
        senderName: initialAdultName,
        otherAdultName: secondaryAdultName,
        childrenNames,
      }),
    ],
  }).addComponentToDocument();

  new DoYouAgreeComponent(
    pdf,
    request.__('sharePlan.yourProposedPlan.doYouAgreeOnBasics', { senderName: initialAdultName }),
  ).addComponentToDocument();

  new TextComponent(pdf, [
    {
      text: request.__('sharePlan.yourProposedPlan.doNotStoreNames'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
    },
    {
      text: request.__('sharePlan.yourProposedPlan.doNotAgreeOnBasics'),
      size: MAIN_TEXT_SIZE,
      style: FontStyles.NORMAL,
      bottomPadding: PARAGRAPH_SPACE,
      urlize: true,
    },
  ]).addComponentToDocument();
};

export default addAboutTheProposal;
