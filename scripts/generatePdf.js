const fs = require('fs');
const path = require('path');

/**
 * Standalone script to generate a blank, GDS-styled PDF.
 * Generates paperForm.pdf for use as a downloadable template.
 * Run via: npm run generate:pdf or node scripts/generatePdf.js
 * 
 * Uses jspdf directly to create a blank PDF with GDS styling
 * (header with crest, footer with page count, margins).
 */

const generatePdf = () => {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const JsPdf = require('jspdf').jsPDF;

    // PDF constants matching server/constants/pdfConstants.ts
    const HEADER_HEIGHT = 25; // mm
    const FOOTER_HEIGHT = 8; // mm
    const MARGIN_WIDTH = 10; // mm
    const MAIN_TEXT_SIZE = 11; // pt
    const PAGE_WIDTH_MM = 210; // A4
    const PAGE_HEIGHT_MM = 297; // A4

    // Create PDF document
    const doc = new JsPdf({ lineHeight: 1.15 });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add black header bar
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    // Add title text to header (centered, white, bold)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Proposed child arrangements plan',
      pageWidth / 2,
      HEADER_HEIGHT / 2 + 2,
      { align: 'center' }
    );

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Add content below header
    let currentY = HEADER_HEIGHT + 10;

    // Main heading
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Propose a child arrangements plan', MARGIN_WIDTH, currentY);
    currentY += 12;

    // Subheading
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('This form helps two people work out their child arrangements without having to go to court.', MARGIN_WIDTH, currentY);
    currentY += 8;

    // Reset to black text
    doc.setTextColor(0, 0, 0);

    // Section: How to use this form
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('How to use this form', MARGIN_WIDTH, currentY);
    currentY += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const howToUseItems = [
      '1. Fill out the form saying what arrangements you would like',
      '2. Let the other parent or carer add their response',
      '3. Make compromises until you reach agreement',
    ];
    howToUseItems.forEach((item) => {
      doc.text(item, MARGIN_WIDTH + 2, currentY);
      currentY += 5;
    });
    currentY += 4;

    // Section: Other ways to work out child arrangements
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Other ways to work out child arrangements', MARGIN_WIDTH, currentY);
    currentY += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('If you don\'t want to use this form you can instead:', MARGIN_WIDTH, currentY);
    currentY += 5;

    const otherWaysItems = [
      '• use the online version of this service on GOV.UK',
      '• find a similar service, such as the CAFCASS parenting plan or the Scottish Government\'s parenting plan',
      '• make a written plan of your own without using any service or template',
      '• get the help of a mediator',
    ];
    otherWaysItems.forEach((item) => {
      const lines = doc.splitTextToSize(item, pageWidth - 2 * MARGIN_WIDTH - 5);
      lines.forEach((line) => {
        doc.text(line, MARGIN_WIDTH + 3, currentY);
        currentY += 4;
      });
    });
    currentY += 3;

    // Section: The benefits of getting a written agreement in place
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('The benefits of getting a written agreement in place', MARGIN_WIDTH, currentY);
    currentY += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const benefitText = 'If you the other parent or carer can work together to make written child arrangements, you\'re more likely to avoid court. You\'re also more likely to get an arrangement that works for you. That\'s because people who go to court often find the judge makes decisions that don\'t suit parents or children.';
    const benefitLines = doc.splitTextToSize(benefitText, pageWidth - 2 * MARGIN_WIDTH);
    benefitLines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });
    currentY += 4;

    // Section: Top tips
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Top tips', MARGIN_WIDTH, currentY);
    currentY += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const tips = [
      '• One of the main reasons people end up in court is that they are not willing to compromise to reach agreement. It may help you avoid court if you can work together to find a compromise that\'s best for your children.',
      '• Get your children\'s input into the arrangements you are making so that they feel included and their needs are met.',
      '• Remember to always put your children\'s needs and feelings first.',
      '• It may not be in the children\'s best interests to split time exactly between households.',
    ];
    tips.forEach((tip) => {
      const tipLines = doc.splitTextToSize(tip, pageWidth - 2 * MARGIN_WIDTH - 5);
      tipLines.forEach((line, idx) => {
        if (idx === 0) {
          doc.text(line, MARGIN_WIDTH + 3, currentY);
        } else {
          doc.text(line, MARGIN_WIDTH + 5, currentY);
        }
        currentY += 4;
      });
      currentY += 1;
    });

    // Add footer on first page
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(MAIN_TEXT_SIZE);
    const pageCountText = `Page 1  of 15`;
    doc.text(
      pageCountText,
      pageWidth - MARGIN_WIDTH,
      pageHeight - MARGIN_WIDTH,
      { align: 'right' }
    );

    // ===== PAGE 2 =====
    doc.addPage();
    currentY = HEADER_HEIGHT + 10;

    // Add black header bar
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    // Add title text to header (centered, white, bold)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Proposed child arrangements',
      pageWidth / 2,
      HEADER_HEIGHT / 2 + 2,
      { align: 'center' }
    );

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Section: Other things
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Other things', MARGIN_WIDTH, currentY);
    currentY += 8;

    // Subsection heading
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('What other things matter to your children?', MARGIN_WIDTH, currentY);
    currentY += 6;

    // Intro text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('You may want to agree things such as:', MARGIN_WIDTH, currentY);
    currentY += 5;

    // Bullet points
    const otherThingsBullets = [
      '• religious practices, diet, and standard rules across both households',
      '• extra-curricular activities, such as swimming lessons',
      '• access to other friends and family',
      '• other types of contact, such as video calls',
    ];
    otherThingsBullets.forEach((bullet) => {
      doc.text(bullet, MARGIN_WIDTH + 3, currentY);
      currentY += 5;
    });
    currentY += 3;

    // Instruction text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const instructionText = 'Enter your name and response to this question in one of the boxes. The other parent should enter their response in the other box.';
    const instructionLines = doc.splitTextToSize(instructionText, pageWidth - 2 * MARGIN_WIDTH);
    instructionLines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });
    currentY += 5;

    // Two boxes side by side for parent responses
    const boxWidth = (pageWidth - 3 * MARGIN_WIDTH) / 2;
    const boxHeight = 60;

    // Left box
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, boxWidth, boxHeight);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Parent name:', MARGIN_WIDTH + 3, currentY + 4);

    // Right box
    const rightBoxX = MARGIN_WIDTH + boxWidth + MARGIN_WIDTH;
    doc.rect(rightBoxX, currentY, boxWidth, boxHeight);
    doc.text('Parent name:', rightBoxX + 3, currentY + 4);

    currentY += boxHeight + 6;

    // Compromise instruction text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('You can use this space to write your agreed compromise for this question.', MARGIN_WIDTH, currentY);
    currentY += 5;

    // Large compromise box
    const compromiseBoxHeight = 80;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, pageWidth - 2 * MARGIN_WIDTH, compromiseBoxHeight);

    // Page footer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(MAIN_TEXT_SIZE);
    doc.text('Page 2  of 15', pageWidth - MARGIN_WIDTH, pageHeight - MARGIN_WIDTH, { align: 'right' });

    // ===== PAGE 3 =====
    doc.addPage();
    currentY = HEADER_HEIGHT + 10;

    // Add black header bar
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    // Add title text to header (centered, white, bold)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Proposed child arrangements',
      pageWidth / 2,
      HEADER_HEIGHT / 2 + 2,
      { align: 'center' }
    );

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Section: If there is a court order in place
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('If there is a court order in place', MARGIN_WIDTH, currentY);
    currentY += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const courtOrderIntroText = 'If you have an order in place that sets out restrictions on contact with your children or ex-partner, you should find a different way to make your child arrangements.';
    const courtOrderIntroLines = doc.splitTextToSize(courtOrderIntroText, pageWidth - 2 * MARGIN_WIDTH);
    courtOrderIntroLines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });
    currentY += 4;

    // Subsection: This type of order may include:
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('This type of order may include:', MARGIN_WIDTH, currentY);
    currentY += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const orderTypes = [
      '• a prohibited steps order',
      '• a specific issue order',
      '• a non-molestation order',
      '• a no contact order',
    ];
    orderTypes.forEach((item) => {
      doc.text(item, MARGIN_WIDTH + 3, currentY);
      currentY += 5;
    });
    currentY += 3;

    // Additional court order text
    const courtOrderText1 = 'Check any legal documents sent to you by a court to see whether you have any of these types of restrictions.';
    const courtOrderText1Lines = doc.splitTextToSize(courtOrderText1, pageWidth - 2 * MARGIN_WIDTH);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    courtOrderText1Lines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });
    currentY += 3;

    const courtOrderText2 = 'If you have one of these types of order, stop now. You will need to find a different way to agree your child arrangements.';
    const courtOrderText2Lines = doc.splitTextToSize(courtOrderText2, pageWidth - 2 * MARGIN_WIDTH);
    courtOrderText2Lines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });
    currentY += 6;

    // Section: If you do not have any restrictions on contact
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('If you do not have any restrictions on contact', MARGIN_WIDTH, currentY);
    currentY += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const noRestrictionsText1 = 'If you do not have any restrictions on contact with your children or ex-partner, you can use this service.';
    const noRestrictionsText1Lines = doc.splitTextToSize(noRestrictionsText1, pageWidth - 2 * MARGIN_WIDTH);
    noRestrictionsText1Lines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });
    currentY += 3;

    const noRestrictionsText2 = 'You can use this service to change child arrangements given to you by a court, so long as the other parent or carer agrees with the changes. You do not need to go back to court to change your arrangements. However, a court can only enforce the child arrangements that are in your court order.';
    const noRestrictionsText2Lines = doc.splitTextToSize(noRestrictionsText2, pageWidth - 2 * MARGIN_WIDTH);
    noRestrictionsText2Lines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });

    // Page footer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(MAIN_TEXT_SIZE);
    doc.text('Page 3  of 15', pageWidth - MARGIN_WIDTH, pageHeight - MARGIN_WIDTH, { align: 'right' });

    // ===== PAGE 4 =====
    doc.addPage();
    currentY = HEADER_HEIGHT + 10;

    // Add black header bar
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    // Add title text to header (centered, white, bold)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Proposed child arrangements',
      pageWidth / 2,
      HEADER_HEIGHT / 2 + 2,
      { align: 'center' }
    );

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Section: About this child arrangements proposal
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('About this child arrangements proposal', MARGIN_WIDTH, currentY);
    currentY += 8;

    // Subsection: Who this child arrangements proposal is for
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Who this child arrangements proposal is for', MARGIN_WIDTH, currentY);
    currentY += 6;

    // Child name boxes (2x2 grid)
    const childBoxWidth = (pageWidth - 3 * MARGIN_WIDTH) / 2;
    const childBoxHeight = 20;
    const childLabelFontSize = 10;

    // Child 1 (top left)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, childBoxWidth, childBoxHeight);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(childLabelFontSize);
    doc.text('Child 1 (first name)', MARGIN_WIDTH + 3, currentY - 2);

    // Child 2 (top right)
    const child2X = MARGIN_WIDTH + childBoxWidth + MARGIN_WIDTH;
    doc.rect(child2X, currentY, childBoxWidth, childBoxHeight);
    doc.text('Child 2 (first name)', child2X + 3, currentY - 2);

    currentY += childBoxHeight + 8;

    // Child 3 (bottom left)
    doc.rect(MARGIN_WIDTH, currentY, childBoxWidth, childBoxHeight);
    doc.text('Child 3 (first name)', MARGIN_WIDTH + 3, currentY - 2);

    // Child 4 (bottom right)
    doc.rect(child2X, currentY, childBoxWidth, childBoxHeight);
    doc.text('Child 4 (first name)', child2X + 3, currentY - 2);

    currentY += childBoxHeight + 8;

    // Note about more children
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('If there are more than 4 children, you can attach a separate sheet', MARGIN_WIDTH, currentY);
    currentY += 8;

    // Section: The adults who will care for the children
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('The adults who will care for the children', MARGIN_WIDTH, currentY);
    currentY += 6;

    // Label for first name
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Your first name', MARGIN_WIDTH, currentY);
    currentY += 2;

    // Helper text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('If you are answering these questions for someone else, enter their first name', MARGIN_WIDTH, currentY);
    currentY += 3;

    // Reset to black text
    doc.setTextColor(0, 0, 0);

    // Your first name box
    const adultBoxWidth = pageWidth - 2 * MARGIN_WIDTH;
    const adultBoxHeight = 20;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, adultBoxWidth, adultBoxHeight);
    currentY += adultBoxHeight + 6;

    // Label for other parent/carer
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('First name of the other parent or carer', MARGIN_WIDTH, currentY);
    currentY += 3;

    // Other parent/carer first name box
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, adultBoxWidth, adultBoxHeight);

    // Page footer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(MAIN_TEXT_SIZE);
    doc.text('Page 4  of 15', pageWidth - MARGIN_WIDTH, pageHeight - MARGIN_WIDTH, { align: 'right' });

    // ===== PAGE 5 =====
    doc.addPage();
    currentY = HEADER_HEIGHT + 10;

    // Add black header bar
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    // Add title text to header (centered, white, bold)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Proposed child arrangements',
      pageWidth / 2,
      HEADER_HEIGHT / 2 + 2,
      { align: 'center' }
    );

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Section: Living and visiting
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Living and visiting', MARGIN_WIDTH, currentY);
    currentY += 8;

    // Subsection heading
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Where will the children mostly live?', MARGIN_WIDTH, currentY);
    currentY += 6;

    // Options text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Options include:', MARGIN_WIDTH, currentY);
    currentY += 5;

    // Options list
    const livingOptions = [
      '• The children will mostly live with you',
      '• The children will mostly live with the other parent or carer',
      '• They\'ll split time between both households',
    ];
    livingOptions.forEach((option) => {
      doc.text(option, MARGIN_WIDTH + 3, currentY);
      currentY += 5;
    });
    currentY += 3;

    // Tip box
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Tip: An exact split of time between two households does not always suit child\'s best interests.', MARGIN_WIDTH, currentY);
    currentY += 5;

    // Instruction text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const livingInstructionText = 'Enter your name and response to this question in one of the boxes. The other parent should enter their response in the other box.';
    const livingInstructionLines = doc.splitTextToSize(livingInstructionText, pageWidth - 2 * MARGIN_WIDTH);
    livingInstructionLines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });
    currentY += 5;

    // Two boxes side by side for parent responses
    const livingBoxWidth = (pageWidth - 3 * MARGIN_WIDTH) / 2;
    const livingBoxHeight = 70;

    // Left box
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, livingBoxWidth, livingBoxHeight);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Parent name:', MARGIN_WIDTH + 3, currentY + 4);

    // Right box
    const livingRightBoxX = MARGIN_WIDTH + livingBoxWidth + MARGIN_WIDTH;
    doc.rect(livingRightBoxX, currentY, livingBoxWidth, livingBoxHeight);
    doc.text('Parent name:', livingRightBoxX + 3, currentY + 4);

    currentY += livingBoxHeight + 6;

    // Compromise instruction text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('You can use this space to write your agreed compromise for this question.', MARGIN_WIDTH, currentY);
    currentY += 5;

    // Large compromise box
    const livingCompromiseBoxHeight = 90;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, pageWidth - 2 * MARGIN_WIDTH, livingCompromiseBoxHeight);

    // Page footer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(MAIN_TEXT_SIZE);
    doc.text('Page 5  of 15', pageWidth - MARGIN_WIDTH, pageHeight - MARGIN_WIDTH, { align: 'right' });

    // ===== PAGE 6 =====
    doc.addPage();
    currentY = HEADER_HEIGHT + 10;

    // Add black header bar
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    // Add title text to header (centered, white, bold)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Proposed child arrangements',
      pageWidth / 2,
      HEADER_HEIGHT / 2 + 2,
      { align: 'center' }
    );

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Main heading
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Which schedule best meets the children\'s needs?', MARGIN_WIDTH, currentY);
    currentY += 6;

    // Question text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('What timetable are you proposing for overnight stays, daytime visits and weekends at the other household?', MARGIN_WIDTH, currentY);
    currentY += 5;

    // Tip
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Tip: It may not be in the children\'s best interests to split time exactly between households.', MARGIN_WIDTH, currentY);
    currentY += 6;

    // Gray box with schedule examples
    const boxX = MARGIN_WIDTH - 1;
    const boxY = currentY;
    const boxW = pageWidth - 2 * MARGIN_WIDTH + 2;
    const boxH = 55;

    // Gray background
    doc.setFillColor(200, 200, 200);
    doc.rect(boxX, boxY, boxW, boxH, 'F');

    // Text in gray box
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    let boxCurrentY = boxY + 3;
    doc.text('Here are some common schedules that can benefit children.', boxX + 3, boxCurrentY);
    boxCurrentY += 4;

    // Schedule columns
    const col1X = boxX + 3;
    const col2X = boxX + boxW / 2;

    // Column 1
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Alternating weeks', col1X, boxCurrentY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('The children will spend one week in one', col1X, boxCurrentY + 3);
    doc.text('household and the next week in the other.', col1X, boxCurrentY + 6);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('2-2-3 schedule', col1X, boxCurrentY + 11);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Children spend two days in one household,', col1X, boxCurrentY + 14);
    doc.text('two days in the other, then back to the first', col1X, boxCurrentY + 17);
    doc.text('house for 3 days including the weekend.', col1X, boxCurrentY + 20);

    // Column 2
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('4-4-3 schedule', col2X, boxCurrentY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Children spend three days in one household', col2X, boxCurrentY + 3);
    doc.text('then four days in the other. The next week', col2X, boxCurrentY + 6);
    doc.text('they switch.', col2X, boxCurrentY + 9);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('2-2-5-5 schedule', col2X, boxCurrentY + 14);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Children spend two days in one household,', col2X, boxCurrentY + 17);
    doc.text('then two days in the other. After that they spend', col2X, boxCurrentY + 20);
    doc.text('five days in one household, then five', col2X, boxCurrentY + 23);
    doc.text('days in the other.', col2X, boxCurrentY + 26);

    currentY = boxY + boxH + 3;

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Instruction text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const scheduleInstructionText = 'Enter your name and proposed schedule in one of the boxes. The other parent should enter their response in the other box.';
    const scheduleInstructionLines = doc.splitTextToSize(scheduleInstructionText, pageWidth - 2 * MARGIN_WIDTH);
    scheduleInstructionLines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });
    currentY += 4;

    // Two boxes side by side for parent responses
    const scheduleBoxWidth = (pageWidth - 3 * MARGIN_WIDTH) / 2;
    const scheduleBoxHeight = 75;

    // Left box
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, scheduleBoxWidth, scheduleBoxHeight);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Parent name:', MARGIN_WIDTH + 3, currentY + 4);

    // Right box
    const scheduleRightBoxX = MARGIN_WIDTH + scheduleBoxWidth + MARGIN_WIDTH;
    doc.rect(scheduleRightBoxX, currentY, scheduleBoxWidth, scheduleBoxHeight);
    doc.text('Parent name:', scheduleRightBoxX + 3, currentY + 4);

    currentY += scheduleBoxHeight + 5;

    // Compromise instruction text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('You can use this space to write your agreed compromise for this question.', MARGIN_WIDTH, currentY);
    currentY += 4;

    // Large compromise box
    const scheduleCompromiseBoxHeight = 50;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, pageWidth - 2 * MARGIN_WIDTH, scheduleCompromiseBoxHeight);

    // Page footer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(MAIN_TEXT_SIZE);
    doc.text('Page 6  of 15', pageWidth - MARGIN_WIDTH, pageHeight - MARGIN_WIDTH, { align: 'right' });

    // ===== PAGE 7 =====
    doc.addPage();
    currentY = HEADER_HEIGHT + 10;

    // Add black header bar
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    // Add title text to header (centered, white, bold)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Proposed child arrangements',
      pageWidth / 2,
      HEADER_HEIGHT / 2 + 2,
      { align: 'center' }
    );

    // Reset text color to black
    doc.setTextColor(0, 0, 0);

    // Section: Handovers and holidays
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Handovers and holidays', MARGIN_WIDTH, currentY);
    currentY += 8;

    // Question heading
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('How will the children get between households?', MARGIN_WIDTH, currentY);
    currentY += 6;

    // Instruction text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const handoverInstructionText = 'Enter your name and response to this question in one of the boxes. The other parent should enter their response in the other box.';
    const handoverInstructionLines = doc.splitTextToSize(handoverInstructionText, pageWidth - 2 * MARGIN_WIDTH);
    handoverInstructionLines.forEach((line) => {
      doc.text(line, MARGIN_WIDTH, currentY);
      currentY += 4;
    });
    currentY += 5;

    // Two boxes side by side for parent responses
    const handoverBoxWidth = (pageWidth - 3 * MARGIN_WIDTH) / 2;
    const handoverBoxHeight = 90;

    // Left box
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, handoverBoxWidth, handoverBoxHeight);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Parent name:', MARGIN_WIDTH + 3, currentY + 4);

    // Right box
    const handoverRightBoxX = MARGIN_WIDTH + handoverBoxWidth + MARGIN_WIDTH;
    doc.rect(handoverRightBoxX, currentY, handoverBoxWidth, handoverBoxHeight);
    doc.text('Parent name:', handoverRightBoxX + 3, currentY + 4);

    currentY += handoverBoxHeight + 5;

    // Compromise instruction text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('You can use this space to write your agreed compromise for this question.', MARGIN_WIDTH, currentY);
    currentY += 5;

    // Large compromise box
    const handoverCompromiseBoxHeight = 110;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN_WIDTH, currentY, pageWidth - 2 * MARGIN_WIDTH, handoverCompromiseBoxHeight);

    // Page footer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(MAIN_TEXT_SIZE);
    doc.text('Page 7  of 15', pageWidth - MARGIN_WIDTH, pageHeight - MARGIN_WIDTH, { align: 'right' });

    // Set document title for PDF metadata
    doc.setProperties({
      title: 'Proposed child arrangements plan',
    });

    // Output paths: write to both source assets and dist assets
    const sourceAssetPath = path.resolve(process.cwd(), 'assets', 'other', 'paperForm.pdf');
    const distAssetPath = path.resolve(process.cwd(), 'dist', 'assets', 'other', 'paperForm.pdf');

    // Ensure directories exist
    fs.mkdirSync(path.dirname(sourceAssetPath), { recursive: true });
    fs.mkdirSync(path.dirname(distAssetPath), { recursive: true });

    // Get PDF output and write to files
    const pdfOutput = doc.output('arraybuffer');
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
