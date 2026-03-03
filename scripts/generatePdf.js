const fs = require('fs');
const path = require('path');
const PdfGenerator = require('./PdfGenerator');
const { version } = require('../package.json');

/**
 * Standalone script to generate a blank, GDS-styled PDF.
 * Generates paperForm.pdf for use as a downloadable template.
 * Run via: npm run generate:pdf or node scripts/generatePdf.js
 *
 * Uses modular PdfGenerator class (similar to server/pdf/pdf.ts)
 * with styling separated into pdfStyles.js
 */

const generatePdf = () => {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const { jsPDF } = require('jspdf');

    // Create PDF generator
    const pdf = new PdfGenerator(jsPDF, version);

    // ===== PAGE 1: Introduction =====
    pdf.addHeader('Proposed child arrangements plan');

    pdf.addSpacing(4); // Add extra spacing above main heading
    pdf.addMainHeading('Propose a child arrangements plan');

    pdf.addBodyText('Use this form from the Child Arrangements Plan service ( https://propose-child-arrangements-plan.service.gov.uk/ ) on GOV.UK to collaborate to create child arrangements which you both agree on, without having to go to court.', { spacing: 3 });
    pdf.addBodyText('Any plan you create using this service is not legally binding. The other person does not have to do what it says and either of you can suggest changes to it at any time.');

    pdf.addSubsectionHeading('How to use this form');
    pdf.addNumberedList([
      '1. Fill out the form saying what arrangements you would like',
      '2. Let the other parent or carer add their response',
      '3. Collaborate until you reach agreement',
    ]);
    pdf.addSpacing(8);

    pdf.addSubsectionHeading('Your safety');
    pdf.addBodyText('You should only use this form if:', { spacing: 2 });
    pdf.addBulletList([
      '• you\'re confident that you and your ex-partner can make decisions together without putting yourself or the children in danger',
      '• both of you do not feel pressured or intimidated into responding',
    ]);
    pdf.addSpacing(3);
    pdf.addBodyText('If you have any concerns about safety, stop now.', { bold: true, spacing: 2 });
    pdf.addBodyText('If you have any feedback or safety concerns about this service, you can email childarrangementssafety@justice.gov.uk.', { spacing: 2 });
    pdf.addBodyText('We cannot answer any questions about child arrangement plans that have already been created.');

    pdf.addFooter(1);

    // ===== PAGE 2: Other ways, benefits, top tips =====
    pdf.addPage();

    pdf.addSubsectionHeading('How making a child arrangements plan can help');
    pdf.addBodyText('You may find that collaborating with the other parent or carer on a child arrangements plan:', { spacing: 2 });
    pdf.addBulletList([
      '• is cheaper and quicker than going to court (it usually takes around 10 months to get a court order, depending on where you live and whether it\'s urgent)',
      '• leads to a better outcome for your children, which you and your ex-partner are in control of',
    ]);
    pdf.addSpacing(3);
    pdf.addBodyText('Going to court can sometimes mean you are not the ones who make the final decisions about your child arrangements.', { spacing: 2 });
    pdf.addSpacing(8);

    pdf.addSubsectionHeading('Top tips for you and your children');
    pdf.addBodyText('Your child arrangements plan should:', { spacing: 2 });
    pdf.addBulletList([
      '• put the child\'s welfare first',
      '• reflect the wishes, feelings and needs of the child',
      '• consider any harm the child has suffered or any risk of harm',
    ]);

    pdf.addFooter(2);

    // ===== PAGE 3: More information and safety (was page 2) =====
    pdf.addPage();

    pdf.addSubsectionHeading('If there is a court order in place');
    pdf.addBodyText('Do not continue if there\'s a court order in place relating to you, the other parent, or the children.', { spacing: 2 });
    pdf.addBodyText('For example, a:', { spacing: 2 });
    pdf.addBulletList([
      '• child arrangements order',
      '• specific issue order',
      '• prohibited steps order',
      '• protective order such as a non-molestation order, occupation order or a domestic abuse protection order',
      '• any other order restricting contact between you and the other parent or the children',
    ]);
    pdf.addSpacing(2);
    pdf.addBodyText('To change or enforce an existing child arrangements order, visit https://www.gov.uk/looking-after-children-divorce/change-or-enforce-an-order', { spacing: 0 });
    pdf.addSpacing(8);

    pdf.addSubsectionHeading('Get more information');
    pdf.addBodyText('Use GOV.UK to find more information, for example:', { spacing: 2 });
    pdf.addBulletList([
      '• making child arrangements: https://www.gov.uk/looking-after-children-divorce',
      '• getting a legal separation: https://www.gov.uk/legal-separation',
      '• getting a divorce: https://www.gov.uk/get-a-divorce',
    ]);
    pdf.addSpacing(8);

    pdf.addSubsectionHeading('If you want legal advice');
    pdf.addBodyText('You can find a legal adviser: https://www.gov.uk/find-legal-advice/find-legal-adviser.', { spacing: 0 });
    pdf.addSpacing(8);

    pdf.addSubsectionHeading('Getting help with domestic abuse');
    pdf.addBodyText('To find out more about signs and effects of child abuse and neglect, visit \nhttps://www.nspcc.org.uk/what-is-child-abuse.', { spacing: 2 });
    pdf.addBodyText('If you\'re unsure whether you\'re a victim of domestic abuse, visit https://www.gov.uk/guidance/domestic-abuse-how-to-get-help#recognise-domestic-abuse.', { spacing: 0 });

    pdf.addFooter(3);

    // ===== PAGE 4: Safety continuation =====
    pdf.addPage();

    pdf.addSubsectionHeading('This plan is not suitable for you if there has been:');
    pdf.addBulletList([
      '• any form of domestic abuse or violence, even if the abuse was not directed at the children',
      '• child abduction or attempted child abduction',
      '• child abuse or neglect',
      '• misuse of drugs, alcohol or other substances',
      '• any other safety or welfare concerns that place anyone at significant risk of harm',
    ]);
    pdf.addSpacing(8);

    pdf.addSubsectionHeading('Feedback and support');
    pdf.addBodyText('To ask for help using this service, or suggest improvements, you can email  childarrangements@justice.gov.uk', { spacing: 2 });
    pdf.addBodyText('We cannot answer any questions about child arrangement plans that have already been created.');

    pdf.addFooter(4);

    // ===== PAGE 5: About this proposal (was page 4) =====
    pdf.addPage();

    pdf.addSectionHeading('About this child arrangements proposal');
    pdf.addBodyText('Who this child arrangements proposal is for');
    pdf.addChildNameGrid();

    pdf.addBodyText('If there are more than 4 children, you can attach a separate sheet', { spacing: 8 });

    pdf.addSpacing(8); // Additional spacing between child name boxes and adult name section
    pdf.addSubsectionHeading('The adults who will care for the children');
    pdf.addInputBox(10, 'Your first name', 'If you are answering these questions for someone else, enter their first name', false);
    pdf.addSpacing(4);
    pdf.addInputBox(10, 'First name of the other parent or carer', null, false);

    pdf.addFooter(5);

    // ===== PAGE 6: Living and visiting (was page 5) =====
    pdf.addPage();

    pdf.addSectionHeading('Living and visiting');
    pdf.addQuestionHeading('Where will the children spend most of their time?');
    pdf.addBodyText('Options include:', { spacing: 5 });
    pdf.addBulletList([
      '• The children will mostly live with you',
      '• The children will mostly live with the other parent or carer',
      '• They\'ll split time between both households',
    ]);
    pdf.addSpacing(3);

    pdf.addTip('Tip: An exact split of time between two households does not always suit children\'s best interests.', { spacing: 0 });
    pdf.addSpacing(4);

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60)
    pdf.addSpacing(4);;
    pdf.addCompromiseBox(90);

    pdf.addFooter(6);

    // ===== PAGE 7: Schedule (was page 6) =====
    pdf.addPage();

    pdf.addQuestionHeading('Which schedule best meets the children\'s needs?');
    pdf.addBodyText('What timetable are you proposing for overnight stays, daytime visits and weekends at the other household?', { spacing: 5 });
    pdf.addTip('Tip: It may not be in the children\'s best interests to split time exactly between households.');
    pdf.addSpacing(6);

    // Info box with schedules (increased height to fit content)
    pdf.addInfoBox((startX, boxWidth) => {
      const col1X = startX;
      const col2X = startX + boxWidth / 2; // Reduced margin between columns
      let boxY = pdf.currentY;

      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.setFontSize(10);
      pdf.doc.text('Here are some common schedules that can work well for children.', col1X, boxY);
      boxY += 6; // Increased from 4 to 6 for more space

      // Column 1
      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.setFontSize(9);
      pdf.doc.text('Alternating weeks', col1X, boxY);
      pdf.doc.setFont('Helvetica', 'normal');
      pdf.doc.text('The children will spend one week in one', col1X, boxY + 4); // Increased spacing
      pdf.doc.text('household and the next week in the other.', col1X, boxY + 7);

      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.text('2-2-3 schedule', col1X, boxY + 13); // Increased spacing
      pdf.doc.setFont('Helvetica', 'normal');
      pdf.doc.text('Children spend two days in one household,', col1X, boxY + 17);
      pdf.doc.text('two days in the other, then back to the first', col1X, boxY + 20);
      pdf.doc.text('house for 3 days including the weekend.', col1X, boxY + 23);

      // Column 2
      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.text('4-4-3 schedule', col2X, boxY);
      pdf.doc.setFont('Helvetica', 'normal');
      pdf.doc.text('Children spend three days in one household', col2X, boxY + 4);
      pdf.doc.text('then four days in the other. The next week', col2X, boxY + 7);
      pdf.doc.text('they switch.', col2X, boxY + 10);

      pdf.doc.setFont('Helvetica', 'bold');
      pdf.doc.text('2-2-5-5 schedule', col2X, boxY + 16); // Increased spacing
      pdf.doc.setFont('Helvetica', 'normal');
      pdf.doc.text('Children spend two days in one household,', col2X, boxY + 20);
      pdf.doc.text('then two days in the other. After that they spend', col2X, boxY + 23);
      pdf.doc.text('five days in one household, then five', col2X, boxY + 26);
      pdf.doc.text('days in the other.', col2X, boxY + 29);

      pdf.currentY = boxY + 32; // Adjusted for new spacing
    }, 45); // Increased height for more bottom padding
    pdf.addSpacing(6);
    pdf.addBodyText('Add your first name and response in the box - the other parent/carer should add their first name and response in the other box.', { spacing: 6 });

    pdf.addParentResponseBoxes(75);
    pdf.addSpacing(6);
    pdf.addCompromiseBox(50);

    pdf.addFooter(7);

    // ===== PAGE 8: Handovers (was page 7) =====
    pdf.addPage();

    pdf.addSectionHeading('Handovers and holidays');
    pdf.addQuestionHeading('How will the children get between households?');

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(110);

    pdf.addFooter(8);

    // ===== PAGE 9: Handover location (was page 8) =====
    pdf.addPage();

    pdf.addQuestionHeading('Where does handover take place?');
    pdf.addBodyText('It may be easier for children if the handover takes place at a neutral location such as a park or railway station which you\'re confident you\'ll both feel safe in.', { spacing: 5 });

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(110);

    pdf.addFooter(9);

    // ===== PAGE 10: School holidays (was page 9) =====
    pdf.addPage();

    pdf.addQuestionHeading('How will the arrangements be different in school holidays?');
    pdf.addBodyText('School holidays include half terms, bank holidays and inset days.', { spacing: 5 });

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(110);

    pdf.addFooter(10);

    // ===== PAGE 11: Items between households (was page 10) =====
    pdf.addPage();

    pdf.addQuestionHeading('What items need to go between households?');
    pdf.addBodyText('Items include clothes, sports kit, school equipment, toys and electronics, medicines and personal care items such as toothbrushes.', { spacing: 5 });

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(110);

    pdf.addFooter(11);

    // ===== PAGE 12: Special days (was page 11) =====
    pdf.addPage();

    pdf.addSectionHeading('Special days');
    pdf.addQuestionHeading('What will happen on special days?');
    pdf.addBodyText('Keep your children\'s needs and best interests at the centre of your plans for holidays and meaningful events. For example, New Year celebrations, Mother\'s Day and Father\'s Day, and birthdays.', { spacing: 5 });

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60); // Reduced from 90
    pdf.addSpacing(8);
    pdf.addCompromiseBox(90); // Reduced from 110

    pdf.addFooter(12);

    // ===== PAGE 13: Other things (was page 12) =====
    pdf.addPage();

    pdf.addSectionHeading('Other things');
    pdf.addQuestionHeading('What other things matter to your children?');
    pdf.addBodyText('You may want to agree things such as:', { spacing: 5 });
    pdf.addBulletList([
      '• religious practices, diet, and standard rules across both households',
      '• extra-curricular activities, such as swimming lessons',
      '• access to other friends and family',
      '• other types of contact, such as video calls',
    ]);
    pdf.addSpacing(3);

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(90);

    pdf.addFooter(13);

    // ===== PAGE 14: Decision making (was page 13) =====
    pdf.addPage();

    pdf.addSectionHeading('Decision making');
    pdf.addQuestionHeading('How should last-minute changes be communicated?');
    pdf.addBodyText('There will be times when plans will need to change, such as if one parent is suddenly unwell and cannot collect a child from school.', { spacing: 5 });
    pdf.addBodyText('Options could include:', { spacing: 5 });
    pdf.addBulletList([
      '• By text message',
      '• With a phone call',
      '• By email',
      '• Using a parenting app',
    ]);
    pdf.addSpacing(3);

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(90);

    pdf.addFooter(14);

    // ===== PAGE 15: When children's needs change (was page 14) =====
    pdf.addPage();

    pdf.addQuestionHeading('When would you like to review this plan?');
    pdf.addBodyText('Children\'s needs change as they grow. When should you review this agreement to check it is still what\'s best for the children?', { spacing: 5 });
    pdf.addBodyText('You can also review these arrangements at an earlier time if they no longer meet your children\'s needs.', { spacing: 5 });
    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60); // Reduced from 90
    pdf.addSpacing(8);
    pdf.addCompromiseBox(90); // Reduced from 110

    pdf.addFooter(15);

    // ===== PAGE 16: What happens now (was page 15) =====
    pdf.addPage();

    pdf.addSectionHeading('What you need to do now');
    pdf.addBodyText('Now give this proposed child arrangements plan to the other parent or carer so they can add their response.', { spacing: 2 });
    pdf.addBodyText('When they have added their response, you can collaborate to reach a shared agreement.')
    pdf.addQuestionHeading('If you can\'t agree');
    pdf.addBodyText('If you are unable to reach agreement about your child arrangements, you can try mediation or another way of agreeing outside of court.',{ spacing: 2 });
    pdf.addBodyText('A mediator is a professional who will work with you to help you make decisions based on your child\u2019s best interests. They listen to both of you and take a neutral approach.',{ spacing: 2 });
    pdf.addBodyText('More information and support is available at: https://www.gov.uk/looking-after-children-divorce')
    pdf.addQuestionHeading('Help us improve this service');
    pdf.addBodyText('With your help we can improve this service for others.', { spacing: 2 });
    pdf.addBodyText('Email childarrangements@justice.gov.uk to express an interest in taking part in research and receive an incentive.');
    pdf.addFooter(16);

    // Set document title for PDF metadata
    pdf.setProperties({
      title: 'Proposed child arrangements plan',
    });

    // Output paths: write to both source assets and dist assets
    const sourceAssetPath = path.resolve(process.cwd(), 'assets', 'other', 'paperForm.pdf');
    const distAssetPath = path.resolve(process.cwd(), 'dist', 'assets', 'other', 'paperForm.pdf');

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
  generatePdf();
}

module.exports = generatePdf;
