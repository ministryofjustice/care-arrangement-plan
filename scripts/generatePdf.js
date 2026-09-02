const fs = require('fs');
const path = require('path');
const PdfGenerator = require('./PdfGenerator');
const { version } = require('../package.json');

/**
 * Standalone script to generate a blank, GDS-styled PDF.
 * Generates paperForm.pdf (English) and paperForm-cy.pdf (Welsh)
 * for use as downloadable templates.
 * Run via: npm run postbuild or node scripts/generatePdf.js [en|cy]
 *
 * Uses modular PdfGenerator class (similar to server/pdf/pdf.ts)
 * with styling separated into pdfStyles.js
 */

const SUPPORTED_LOCALES = ['en', 'cy'];

const paperFormFileName = (locale) => (locale === 'en' ? 'paperForm.pdf' : `paperForm-${locale}.pdf`);

const generatePdf = (locale = 'en') => {
  try {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const localeData = require(`../server/locales/${locale}.json`);
    const t = localeData.paperForm;

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const { jsPDF } = require('jspdf');

    // Create PDF generator
    const pdf = new PdfGenerator(jsPDF, version);

    // ===== PAGE 1: Introduction =====
    pdf.addHeader(t.title);

    pdf.addBodyText(t.intro, { spacing: 3 });
    pdf.addBodyText(t.notLegallyBinding);

    pdf.addSubsectionHeading(t.howToUseThisForm.title);
    pdf.addNumberedList([
      t.howToUseThisForm.howToUseSteps.fillOut,
      t.howToUseThisForm.howToUseSteps.letOtherRespond,
      t.howToUseThisForm.howToUseSteps.collaborate,
    ]);
    pdf.addSpacing(8);

    pdf.addSubsectionHeading(t.yourSafety.title);
    pdf.addBodyText(t.yourSafety.intro, { spacing: 2 });
    pdf.addBulletList([
      t.yourSafety.safetySteps.youAreConfident,
      t.yourSafety.safetySteps.doNotFeelPressured,
    ]);
    pdf.addSpacing(3);
    pdf.addBodyText(t.yourSafety.stopNow, { bold: true, spacing: 2 });
    pdf.addBodyText(t.yourSafety.feedbackOrSafetyConcerns, { spacing: 2 });
    pdf.addBodyText(t.yourSafety.cannotAnswerQuestions);

    pdf.addFooter(1);

    // ===== PAGE 2: Other ways, benefits, top tips =====
    pdf.addPage();

    pdf.addSubsectionHeading(t.howMakingChildArrangementsPlanHelp.title);
    pdf.addBodyText(t.howMakingChildArrangementsPlanHelp.intro, { spacing: 2 });
    pdf.addBulletList([
      t.howMakingChildArrangementsPlanHelp.benefits.cheaperAndQuicker,
      t.howMakingChildArrangementsPlanHelp.benefits.betterOutcome,
    ]);
    pdf.addSpacing(3);
    pdf.addBodyText(t.howMakingChildArrangementsPlanHelp.goingToCourt, { spacing: 2 });
    pdf.addSpacing(8);

    pdf.addSubsectionHeading(t.howMakingChildArrangementsPlanHelp.tips);
    pdf.addBodyText(t.howMakingChildArrangementsPlanHelp.planShouldIntro, { spacing: 2 });
    pdf.addBulletList([
      t.howMakingChildArrangementsPlanHelp.planShould.welfare,
      t.howMakingChildArrangementsPlanHelp.planShould.wishes,
      t.howMakingChildArrangementsPlanHelp.planShould.considerAnyHarm,
    ]);

    pdf.addFooter(2);

    // ===== PAGE 3: More information and safety (was page 2) =====
    pdf.addPage();

    pdf.addSubsectionHeading(t.ifCourtOrderInPlace.title);
    pdf.addBodyText(t.ifCourtOrderInPlace.doNotContinue, { spacing: 2 });
    pdf.addBodyText(t.ifCourtOrderInPlace.forExample, { spacing: 2 });
    pdf.addBulletList([
      t.ifCourtOrderInPlace.orderList.childArrangementsOrder,
      t.ifCourtOrderInPlace.orderList.specificIssueOrder,
      t.ifCourtOrderInPlace.orderList.prohibitedStepsOrder,
      t.ifCourtOrderInPlace.orderList.protectiveOrder,
      t.ifCourtOrderInPlace.orderList.anyOther,
    ]);
    pdf.addSpacing(2);
    pdf.addBodyText(t.ifCourtOrderInPlace.toChangeOrEnforce, { spacing: 0 });
    pdf.addSpacing(8);

    pdf.addSubsectionHeading(t.ifCourtOrderInPlace.getMoreInformation.title);
    pdf.addBodyText(t.ifCourtOrderInPlace.getMoreInformation.moreInfo, { spacing: 2 });
    pdf.addBulletList([
      t.ifCourtOrderInPlace.getMoreInformation.moreInfoList.makingChildArrangements,
      t.ifCourtOrderInPlace.getMoreInformation.moreInfoList.legalSeparation,
      t.ifCourtOrderInPlace.getMoreInformation.moreInfoList.divorce,
    ]);
    pdf.addSpacing(8);

    pdf.addSubsectionHeading(t.ifCourtOrderInPlace.legalAdvice.title);
    pdf.addBodyText(t.ifCourtOrderInPlace.legalAdvice.findLegalAdviser, { spacing: 0 });
    pdf.addSpacing(8);

    pdf.addSubsectionHeading(t.ifCourtOrderInPlace.domesticAbuse.title);
    pdf.addBodyText(t.ifCourtOrderInPlace.domesticAbuse.signsAndEffects, { spacing: 2 });
    pdf.addBodyText(t.ifCourtOrderInPlace.domesticAbuse.unsureVictim, { spacing: 0 });

    pdf.addFooter(3);

    // ===== PAGE 4: Safety continuation =====
    pdf.addPage();

    pdf.addSubsectionHeading(t.notSuitableForYou.title);
    pdf.addBulletList([
      t.notSuitableForYou.anyForm,
      t.notSuitableForYou.childAbduction,
      t.notSuitableForYou.childAbuse,
      t.notSuitableForYou.drugsOrAlcohol,
      t.notSuitableForYou.anyOtherSafety,
    ]);
    pdf.addSpacing(8);

    pdf.addSubsectionHeading(t.notSuitableForYou.feedbackAndSupport.title);
    pdf.addBodyText(t.notSuitableForYou.feedbackAndSupport.toAskForHelp, { spacing: 2 });
    pdf.addBodyText(t.notSuitableForYou.weCannotAnswer);

    pdf.addFooter(4);

    // ===== PAGE 5: About this proposal (was page 4) =====
    pdf.addPage();

    pdf.addSectionHeading(t.childArrangementsProposal.title);
    pdf.addBodyText(t.childArrangementsProposal.intro);
    pdf.addChildNameGrid(t.childArrangementsProposal);

    pdf.addSpacing(8); // Additional spacing between child name boxes and adult name section
    pdf.addSubsectionHeading(t.childArrangementsProposal.careForChildren);
    pdf.addInputBox(10, t.childArrangementsProposal.yourFirstName, t.childArrangementsProposal.answeringTheseQuestions, false);
    pdf.addSpacing(4);
    pdf.addInputBox(10, t.childArrangementsProposal.otherParentFirstName, null, false);

    pdf.addFooter(5);

    // ===== PAGE 6: Living and visiting (was page 5) =====
    pdf.addPage();

    pdf.addSectionHeading(t.livingAndVisiting.title);
    pdf.addQuestionHeading(t.livingAndVisiting.intro);
    pdf.addBodyText(t.optionsCouldInclude, { spacing: 5 });
    pdf.addBulletList([
      t.livingAndVisiting.options.mostlyLiveWithYou,
      t.livingAndVisiting.options.mostlyLiveWithOther,
      t.livingAndVisiting.options.splitTime,
      t.livingAndVisiting.options.anotherArrangement,
    ]);
    pdf.addSpacing(3);

    pdf.addTip(t.livingAndVisiting.tip, { spacing: 0 });
    pdf.addSpacing(4);

    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60)
    pdf.addSpacing(4);;
    pdf.addCompromiseBox(t, 90);

    pdf.addFooter(6);

    // ===== PAGE 7: Schedule (was page 6) =====
    pdf.addPage();

    pdf.addQuestionHeading(t.scheduleMeetsChildrenNeeds.title);
    pdf.addBodyText(t.scheduleMeetsChildrenNeeds.intro, { spacing: 5 });
    pdf.addTip('Tip: An exact split of time between two households does not always suit children\'s best interests.');
    pdf.addSpacing(6);

    // Info box with schedules (increased height to fit content)
    pdf.addInfoBox((startX, boxWidth) => {
      const col1X = startX;
      const col2X = startX + boxWidth / 2; // Reduced margin between columns
      let boxY = pdf.currentY;

      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.setFontSize(10);
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.commonSchedulesIntro, col1X, boxY);
      boxY += 6; // Increased from 4 to 6 for more space

      // Column 1
      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.setFontSize(9);
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.alternatingWeeks, col1X, boxY);
      pdf.doc.setFont('Helvetica', 'normal');
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.alternatingWeeksDescription, col1X, boxY + 4); // Increased spacing
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.alternatingWeeksDescription, col1X, boxY + 7);

      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule223, col1X, boxY + 13); // Increased spacing
      pdf.doc.setFont('Helvetica', 'normal');
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule223Description, col1X, boxY + 17);
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule223Description, col1X, boxY + 20);
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule223Description, col1X, boxY + 23);

      // Column 2
      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule443, col2X, boxY);
      pdf.doc.setFont('Helvetica', 'normal');
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule443Description, col2X, boxY + 4);
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule443Description, col2X, boxY + 7);
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule443Description, col2X, boxY + 10);

      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule2255, col2X, boxY + 16); // Increased spacing
      pdf.doc.setFont('Helvetica', 'normal');
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule2255Description, col2X, boxY + 20);
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule2255Description, col2X, boxY + 23);
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule2255Description, col2X, boxY + 26);
      pdf.doc.text(t.scheduleMeetsChildrenNeeds.schedule2255Description, col2X, boxY + 29);

      pdf.currentY = boxY + 32; // Adjusted for new spacing
    }, 45); // Increased height for more bottom padding
    pdf.addSpacing(6);
    pdf.addBodyText(t.responseInTheBox, { spacing: 6 });

    pdf.addParentResponseBoxes(t, 75);
    pdf.addSpacing(6);
    pdf.addCompromiseBox(t, 50);

    pdf.addFooter(7);

    // ===== PAGE 8: Handovers (was page 7) =====
    pdf.addPage();

    pdf.addSectionHeading(t.handoversAndHolidays.title);
    pdf.addQuestionHeading(t.handoversAndHolidays.intro);
    pdf.addBodyText(t.optionsCouldInclude, { spacing: 5 });
    pdf.addBulletList([
      t.handoversAndHolidays.options.youCollect,
      t.handoversAndHolidays.options.otherCollects,
      t.handoversAndHolidays.options.anotherArrangement,
    ]);
    pdf.addSpacing(3);

    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(t, 110);

    pdf.addFooter(8);

    // ===== PAGE 9: Handover location (was page 8) =====
    pdf.addPage();

    pdf.addQuestionHeading(t.handoverLocation.title);
    pdf.addBodyText(t.handoverLocation.intro, { spacing: 5 });
    pdf.addBodyText(t.optionsCouldInclude, { spacing: 5 });
    pdf.addBulletList([
      t.handoverLocation.handoverLocationList.neutralLocation,
      t.handoverLocation.handoverLocationList.atHome,
      t.handoverLocation.handoverLocationList.atOtherHome,
      t.handoverLocation.handoverLocationList.atSchool,
    ]);
    pdf.addSpacing(3);

    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(t, 110);

    pdf.addFooter(9);

    // ===== PAGE 10: School holidays (was page 9) =====
    pdf.addPage();

    pdf.addQuestionHeading(t.arrangementsSchoolHolidays.title);
    pdf.addBodyText(t.arrangementsSchoolHolidays.intro, { spacing: 5 });

    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(t, 110);

    pdf.addFooter(10);

    // ===== PAGE 11: Items between households (was page 10) =====
    pdf.addPage();

    pdf.addQuestionHeading(t.itemsBetweenHouseholds.title);
    pdf.addBodyText(t.itemsBetweenHouseholds.intro, { spacing: 5 });

    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(t, 110);

    pdf.addFooter(11);

    // ===== PAGE 12: Special days (was page 11) =====
    pdf.addPage();

    pdf.addSectionHeading('Special days');
    pdf.addQuestionHeading(t.specialDays.title);
    pdf.addBodyText(t.specialDays.intro, { spacing: 5 });

    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60); // Reduced from 90
    pdf.addSpacing(8);
    pdf.addCompromiseBox(t, 90); // Reduced from 110

    pdf.addFooter(12);

    // ===== PAGE 13: Other things (was page 12) =====
    pdf.addPage();

    pdf.addSectionHeading('Other things');
    pdf.addQuestionHeading(t.otherThings.title);
    pdf.addBodyText(t.otherThings.intro, { spacing: 5 });
    pdf.addBulletList([
      t.otherThings.otherThingsList.religionDietAndRules,
      t.otherThings.otherThingsList.extraCurriculars,
      t.otherThings.otherThingsList.friendsAndFamily,
      t.otherThings.otherThingsList.otherContact,
    ]);
    pdf.addSpacing(3);

    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(t, 90);

    pdf.addFooter(13);

    // ===== PAGE 14: Decision making (was page 13) =====
    pdf.addPage();

    pdf.addSectionHeading('Decision making');
    pdf.addQuestionHeading(t.decisionMaking.title);
    pdf.addBodyText(t.decisionMaking.intro, { spacing: 5 });
    pdf.addBodyText(t.optionsCouldInclude, { spacing: 5 });
    pdf.addBulletList([
      t.decisionMaking.decisionMakingList.text,
      t.decisionMaking.decisionMakingList.phone,
      t.decisionMaking.decisionMakingList.email,
      t.decisionMaking.decisionMakingList.app,
      t.decisionMaking.decisionMakingList.anotherArrangement,
    ]);
    pdf.addSpacing(3);

    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(t, 90);

    pdf.addQuestionHeading(t.noticeForLongTermArrangements.title);
    pdf.addBodyText(t.noticeForLongTermArrangements.intro, { spacing: 5 });
    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(t,90);

    pdf.addFooter(14);

    // ===== PAGE 15: When children's needs change (was page 14) =====
    pdf.addPage();

    pdf.addQuestionHeading(t.reviewingThePlan.title);
    pdf.addBodyText(t.reviewingThePlan.intro, { spacing: 5 });
    pdf.addBodyText(t.reviewingThePlan.youCanAlsoReview, { spacing: 5 });
    pdf.addParentBoxInstruction(t);
    pdf.addParentResponseBoxes(t, 60); // Reduced from 90
    pdf.addSpacing(8);
    pdf.addCompromiseBox(t, 90); // Reduced from 110

    pdf.addFooter(15);

    // ===== PAGE 16: What happens now (was page 15) =====
    pdf.addPage();

    pdf.addSectionHeading('Next steps');
    pdf.addQuestionHeading(t.nextSteps.title);
    pdf.addBodyText(t.nextSteps.addTheirResponse, { spacing: 2 });
    pdf.addBodyText(t.nextSteps.collaborateToAgree);
    pdf.addQuestionHeading(t.nextSteps.noResponse);
    pdf.addBodyText(t.nextSteps.unableToAgree, { spacing: 2 });
    pdf.addBodyText(t.nextSteps.mediator,{ spacing: 2 });
    pdf.addBodyText(t.nextSteps.moreInformation);
    pdf.addFooter(16);

    // Set document title for PDF metadata
    pdf.setProperties({
      title: t.title,
    });

    // Output paths: write to both source assets and dist assets
    const fileName = paperFormFileName(locale);
    const sourceAssetPath = path.resolve(process.cwd(), 'assets', 'other', fileName);
    const distAssetPath = path.resolve(process.cwd(), 'dist', 'assets', 'other', fileName);

    // Ensure directories exist
    fs.mkdirSync(path.dirname(sourceAssetPath), { recursive: true });
    fs.mkdirSync(path.dirname(distAssetPath), { recursive: true });

    // Get PDF output and write to files
    const pdfOutput = pdf.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfOutput);

    fs.writeFileSync(sourceAssetPath, pdfBuffer);
    fs.writeFileSync(distAssetPath, pdfBuffer);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  const locale = process.argv[2] || 'en';
  generatePdf(locale);
}

module.exports = generatePdf;
