const fs = require('fs');
const path = require('path');
const PdfGenerator = require('./PdfGenerator');

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
    const pdf = new PdfGenerator(jsPDF);

    // ===== PAGE 1: Introduction =====
    pdf.addHeader('Proposed child arrangements plan');

    pdf.addSpacing(4); // Add extra spacing above main heading
    pdf.addMainHeading('Propose a child arrangements plan');

    pdf.addBodyText('This form helps two people collaborate to work out their child arrangements without having to go to court.', { spacing: 3 });
    pdf.addBodyText('Any plan you create using this service is not legally binding. The other person does not have to do what it says and either of you can suggest changes to it at any time. ')

    pdf.addSubsectionHeading('How to use this form');
    pdf.addNumberedList([
      '1. Fill out the form saying what arrangements you would like',
      '2. Let the other parent or carer add their response',
      '3. Make compromises until you reach agreement',
    ]);
    pdf.addSpacing(8);

    pdf.addSubsectionHeading('Other ways to work out child arrangements');
    pdf.addBodyText('If you don\'t want to use this form you can instead:', { spacing: 2 });
    pdf.addBulletList([
      '• use the online version of this service on GOV.UK',
      '• find a similar service, such as the CAFCASS parenting plan or the Scottish Government\'s parenting plan',
      '• make a written plan of your own without using any service or template',
      '• get the help of a mediator',
    ]);
    pdf.addSpacing(8);

    pdf.addSubsectionHeading('The benefits of getting a written agreement in place');
    pdf.addBodyText('If you the other parent or carer can work together to make written child arrangements, you’re more likely to avoid court.', { spacing: 2 });
    pdf.addBodyText('You’re also more likely to get an arrangement that works for you.', { spacing: 2 });
    pdf.addBodyText('That\'s because people who go to court can often find they don’t keep their ability to make decisions on their children’s wellbeing.', { spacing: 2 })
    pdf.addSpacing(8);

    pdf.addSubsectionHeading('Top tips for you and your children');
    pdf.addBulletList([
      '• One of the main reasons people end up in court is that they are not willing to compromise to reach agreement. It may help you avoid court if you can work together to find a compromise that\'s best for your children.',
      '• Get your children\'s input into the arrangements you are making so that they feel included and their needs are met.',
      '• Remember to always put your children\'s needs and feelings first.',
      '• It may not be in the children\'s best interests to split time exactly between households.',
    ]);

    pdf.addFooter(1);

    // ===== PAGE 2: More information and safety =====
    pdf.addPage();

    pdf.addSectionHeading('More information about divorce and separation');
    pdf.addBodyText('Check GOV.UK to find what support is available. You can search for topics including:', { spacing: 2 });
    pdf.addBulletList([
      '• what you need to do if separating or divorcing',
      '• making child arrangements',
    ]);
    pdf.addSpacing(8);

    pdf.addSectionHeading('Safety check');
    pdf.addBodyText('To make child arrangements you need to be able to state your needs and views without feeling intimidated. The other parent or carer must not be a threat to you or to your children\'s safety.', { spacing: 5 });
    pdf.addBodyText('Do not continue with this process if there has been:', { spacing: 2 });
    pdf.addBulletList([
      '• any form of domestic abuse, even if the abuse was not directed at the children',
      '• actual or attempted child abduction',
      '• misuse of drugs, alcohol or other substances',
      '• any other safety or welfare concerns that place anyone at significant risk of harm',
    ]);
    pdf.addSpacing(3);

    pdf.addBodyText('If you have any concerns about safety, stop now. Find another way to make arrangements by visiting', { spacing: 0 });
    pdf.addBodyText('https://helpwithchildarrangements.service.justice.gov.uk', { bold: true });
    
    pdf.addSpacing(8);
    pdf.addSubsectionHeading('Getting help with domestic abuse');
    pdf.addBodyText('To find out more about what is child abuse and neglect, visit ', { spacing: 0});
    pdf.addBodyText(' https://www.nspcc.org.uk/what-is-child-abuse', { bold: true })
    pdf.addBodyText('If you\'re unsure whether you\'re a victim of domestic abuse, visit ', { spacing: 0 });
    pdf.addBodyText('https://www.gov.uk/guidance/domestic-abuse-how-to-get-help#recognise-domestic-abuse.', { bold: true });

    pdf.addFooter(2);

    // ===== PAGE 3: Court orders =====
    pdf.addPage();

    pdf.addSubsectionHeading('If there is a court order in place');
    pdf.addBodyText('If you have an order in place that sets out restrictions on contact with your children or ex-partner, you should find a different way to make your child arrangements.', { spacing: 4 });
    pdf.addSpacing(4);

    pdf.addQuestionHeading('This type of order may include:');
    pdf.addBulletList([
      '• a prohibited steps order',
      '• a specific issue order',
      '• a non-molestation order',
      '• a no contact order',
    ]);
    pdf.addSpacing(3);

    pdf.addBodyText('Check any legal documents sent to you by a court to see whether you have any of these types of restrictions.', { spacing: 3 });
    pdf.addBodyText('If you have one of these types of order, stop now. You will need to find a different way to agree your child arrangements.', { spacing: 6 });
    
    pdf.addSpacing(4);
    pdf.addSubsectionHeading('If you do not have any restrictions on contact');
    pdf.addBodyText('If you do not have any restrictions on contact with your children or ex-partner, you can use this service.', { spacing: 3 });
    pdf.addBodyText('You can use this service to change child arrangements given to you by a court, so long as the other parent or carer agrees with the changes. You do not need to go back to court to change your arrangements. However, a court can only enforce the child arrangements that are in your court order.');

    pdf.addFooter(3);

    // ===== PAGE 4: About this proposal =====
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

    pdf.addFooter(4);

    // ===== PAGE 5: Living and visiting =====
    pdf.addPage();

    pdf.addSectionHeading('Living and visiting');
    pdf.addQuestionHeading('Where will the children mostly live?');
    pdf.addBodyText('Options include:', { spacing: 5 });
    pdf.addBulletList([
      '• The children will mostly live with you',
      '• The children will mostly live with the other parent or carer',
      '• They\'ll split time between both households',
    ]);
    pdf.addSpacing(3);

    pdf.addTip('Tip: An exact split of time between two households does not always suit child\'s best interests.', { spacing: 0 });
    pdf.addSpacing(4);

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60)
    pdf.addSpacing(4);;
    pdf.addCompromiseBox(90);

    pdf.addFooter(5);

    // ===== PAGE 6: Schedule =====
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
      pdf.doc.text('Here are some common schedules that can benefit children.', col1X, boxY);
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

    pdf.addFooter(6);

    // ===== PAGE 7: Handovers =====
    pdf.addPage();

    pdf.addSectionHeading('Handovers and holidays');
    pdf.addQuestionHeading('How will the children get between households?');

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(110);

    pdf.addFooter(7);

    // ===== PAGE 8: Handover location =====
    pdf.addPage();

    pdf.addQuestionHeading('Where does handover take place?');
    pdf.addBodyText('It may be easier for children if the handover takes place at a neutral location such as a park or railway station.', { spacing: 5 });

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(110);

    pdf.addFooter(8);

    // ===== PAGE 9: School holidays =====
    pdf.addPage();

    pdf.addQuestionHeading('How will the arrangements be different in school holidays?');
    pdf.addBodyText('School holidays include half terms, bank holidays and inset days.', { spacing: 5 });

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(110);

    pdf.addFooter(9);

    // ===== PAGE 10: Items between households =====
    pdf.addPage();

    pdf.addQuestionHeading('What items need to go between households?');
    pdf.addBodyText('Items include clothes, sports kit, school equipment, toys and electronics, medicines and personal care items such as toothbrushes.', { spacing: 5 });

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(110);

    pdf.addFooter(10);

    // ===== PAGE 11: Special days =====
    pdf.addPage();

    pdf.addSectionHeading('Special days');
    pdf.addQuestionHeading('What will happen on special days?');
    pdf.addBodyText('Keep your children\'s feelings at the centre of your plans for holidays and meaningful events. For example, New Year celebrations, Mother\'s Day and Father\'s Day, and birthdays.', { spacing: 5 });

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60); // Reduced from 90
    pdf.addSpacing(8);
    pdf.addCompromiseBox(90); // Reduced from 110

    pdf.addFooter(11);

    // ===== PAGE 12: Other things =====
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

    pdf.addFooter(12);

    // ===== PAGE 13: Decision making =====
    pdf.addPage();

    pdf.addSectionHeading('Decision making');
    pdf.addQuestionHeading('How should last-minute changes be communicated?');
    pdf.addBodyText('There will be times when plans will need to change, such as if one parent is suddenly unwell and cannot collect a child from school.', { spacing: 5 });
    pdf.addBodyText('Options could include:', { spacing: 5 });
    pdf.addBulletList([
      '• By test message',
      '• With a phone call',
      '• By email',
      '• Using a parenting app',
    ]);
    pdf.addSpacing(3);

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60);
    pdf.addSpacing(8);
    pdf.addCompromiseBox(90);

    pdf.addFooter(13);

    // ===== PAGE 14: When children's needs change =====
    pdf.addPage();

    pdf.addQuestionHeading('When will the children\'s needs change?');
    pdf.addBodyText('You can also review these arrangements at an earlier time if they no longer meet your children\'s needs.', { spacing: 5 });
    pdf.addBodyText('Children\'s needs change as they grow. When should you review this agreement to check it is still what\'s best for the children?', { spacing: 5 });

    pdf.addParentBoxInstruction();
    pdf.addParentResponseBoxes(60); // Reduced from 90
    pdf.addSpacing(8);
    pdf.addCompromiseBox(90); // Reduced from 110

    pdf.addFooter(14);

    // ===== PAGE 15: What happens now =====
    pdf.addPage();

    pdf.addSectionHeading('What you need to do now');
    pdf.addBodyText('Now give this proposed child arrangements plan to the other parent or carer so they can add their response.', { spacing: 2 });
    pdf.addBodyText('When they have added their response, you can collaborate to reach a shared agreement.')
    pdf.addQuestionHeading('If you can\'t agree');
    pdf.addBodyText('If you are unable to reach agreement about your child arrangements, you can try mediation.',{ spacing: 2 });
    pdf.addBodyText('More information and support is available by visiting https://www.gov.uk/looking-after-children-divorce')
    pdf.addQuestionHeading('Help us improve this service')
    pdf.addBodyText('With your help we can continually improve this service for other users.', { spacing: 2 });
    pdf.addBodyText('Email email address to express an interest in taking part in research and receive an incentive.');
    pdf.addFooter(15);

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

    // eslint-disable-next-line no-console
    console.log(`✓ Generated blank PDF at ${sourceAssetPath}`);
    // eslint-disable-next-line no-console
    console.log(`✓ Generated blank PDF at ${distAssetPath}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate PDF:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  generatePdf();
}

module.exports = generatePdf;
