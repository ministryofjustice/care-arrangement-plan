const fs = require('fs');
const path = require('path');
const PdfStyles = require('./pdfStyles');

/**
 * PDF Generator class - modular approach similar to server/pdf/pdf.ts
 * Handles the creation of GDS-styled PDF documents
 */
class PdfGenerator {
  constructor(JsPDF) {
    this.JsPDF = JsPDF;
    this.doc = new JsPDF({ lineHeight: PdfStyles.LINE_HEIGHT_RATIO });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = PdfStyles.HEADER_HEIGHT + 10;
    this.currentPage = 1;
    this.totalPages = 15; // Known from the form

    // Load GOV.UK crest logo
    const crestPath = path.resolve(process.cwd(), 'assets', 'images', 'crest.png');
    this.logoData = `data:image/png;base64,${fs.readFileSync(crestPath, { encoding: 'base64' })}`;
  }

  /**
   * Add black header bar with GOV.UK crest and title
   * Matches the TypeScript version in server/pdf/pdf.ts
   */
  addHeader(title) {
    // Black header bar
    this.doc.setFillColor(...PdfStyles.COLOR_BLACK);
    this.doc.rect(0, 0, this.pageWidth, PdfStyles.HEADER_HEIGHT, 'F');

    // Add GOV.UK crest logo
    const headerLogoWidth = PdfStyles.HEADER_LOGO_HEIGHT * 5;
    this.doc.addImage(
      this.logoData,
      'PNG',
      PdfStyles.MARGIN_WIDTH,
      0.5 * (PdfStyles.HEADER_HEIGHT - PdfStyles.HEADER_LOGO_HEIGHT),
      headerLogoWidth,
      PdfStyles.HEADER_LOGO_HEIGHT
    );

    // Add title text (matching TypeScript calculation)
    const titleSize = PdfStyles.SECTION_HEADING_SIZE;
    const titleX = headerLogoWidth + PdfStyles.MARGIN_WIDTH +
                   0.5 * (this.pageWidth - headerLogoWidth - PdfStyles.MARGIN_WIDTH);
    const titleY = PdfStyles.HEADER_HEIGHT * 0.5 +
                   0.25 * PdfStyles.LINE_HEIGHT_RATIO * titleSize * PdfStyles.MM_PER_POINT;

    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_BOLD);
    this.doc.setFontSize(titleSize);
    this.doc.setTextColor(...PdfStyles.COLOR_WHITE);
    this.doc.text(title, titleX, titleY, { align: 'center' });

    // Reset text color
    this.doc.setTextColor(...PdfStyles.COLOR_BLACK);
  }

  /**
   * Add footer with page number
   */
  addFooter(pageNumber = this.currentPage) {
    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_NORMAL);
    this.doc.setFontSize(PdfStyles.MAIN_TEXT_SIZE);
    const pageCountText = `Page ${pageNumber}  of ${this.totalPages}`;
    this.doc.text(
      pageCountText,
      this.pageWidth - PdfStyles.MARGIN_WIDTH,
      this.pageHeight - PdfStyles.MARGIN_WIDTH,
      { align: 'right' }
    );
  }

  /**
   * Add a new page with header
   */
  addPage(headerTitle = 'Proposed child arrangements') {
    this.doc.addPage();
    this.currentPage++;
    this.currentY = PdfStyles.HEADER_HEIGHT + 10;
    this.addHeader(headerTitle);
  }

  /**
   * Add main heading (large, bold) - 22pt
   */
  addMainHeading(text) {
    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_BOLD);
    this.doc.setFontSize(PdfStyles.SECTION_HEADING_SIZE);
    this.doc.setTextColor(...PdfStyles.COLOR_BLACK);
    this.doc.text(text, PdfStyles.MARGIN_WIDTH, this.currentY);
    this.currentY += 12;
  }

  /**
   * Add section heading (large, bold) - 22pt
   */
  addSectionHeading(text) {
    this.currentY += 2; // Reduced spacing above heading
    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_BOLD);
    this.doc.setFontSize(PdfStyles.SECTION_HEADING_SIZE);
    this.doc.setTextColor(...PdfStyles.COLOR_BLACK);
    this.doc.text(text, PdfStyles.MARGIN_WIDTH, this.currentY);
    this.currentY += 8; // Increased spacing below heading
  }

  /**
   * Add subsection heading (medium, bold) - 14pt
   */
  addSubsectionHeading(text) {
    this.currentY += 2; // Spacing above heading
    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_BOLD);
    this.doc.setFontSize(PdfStyles.QUESTION_TITLE_SIZE);
    this.doc.setTextColor(...PdfStyles.COLOR_BLACK);
    this.doc.text(text, PdfStyles.MARGIN_WIDTH, this.currentY);
    this.currentY += 10; // Increased spacing below heading
  }

  /**
   * Add question heading (medium, bold) - 14pt
   */
  addQuestionHeading(text) {
    this.currentY += 2; // Spacing above heading
    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_BOLD);
    this.doc.setFontSize(PdfStyles.QUESTION_TITLE_SIZE);
    this.doc.setTextColor(...PdfStyles.COLOR_BLACK);
    this.doc.text(text, PdfStyles.MARGIN_WIDTH, this.currentY);
    this.currentY += 10; // Increased spacing below heading
  }

  /**
   * Add body text (normal weight) with optional clickable links
   */
  addBodyText(text, options = {}) {
    const {
      indent = 0,
      gray = false,
      spacing = 5,
      wrap = true
    } = options;

    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_NORMAL);
    this.doc.setFontSize(PdfStyles.MAIN_TEXT_SIZE);
    this.doc.setTextColor(...(gray ? PdfStyles.COLOR_GRAY : PdfStyles.COLOR_BLACK));

    const x = PdfStyles.MARGIN_WIDTH + indent;
    const maxWidth = wrap ? this.pageWidth - 2 * PdfStyles.MARGIN_WIDTH - indent : null;

    if (wrap) {
      const lines = this.doc.splitTextToSize(text, maxWidth);

      // Check if text contains URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const hasLinks = urlRegex.test(text);

      if (hasLinks) {
        // Extract URLs from original text
        const urls = text.match(urlRegex) || [];
        let urlIndex = 0;

        lines.forEach(line => {
          // Check if this line contains a URL
          const lineUrls = line.match(urlRegex);
          if (lineUrls) {
            // Split line by URL and add clickable links
            let currentX = x;
            const parts = line.split(urlRegex);

            parts.forEach((part) => {
              if (urlRegex.test(part) && urls[urlIndex]) {
                // This is a URL - make it clickable
                this.doc.textWithLink(part, currentX, this.currentY, { url: urls[urlIndex] });
                urlIndex++;
              } else if (part) {
                // Regular text
                this.doc.text(part, currentX, this.currentY);
              }
              currentX += this.doc.getTextWidth(part);
            });
          } else {
            this.doc.text(line, x, this.currentY);
          }
          this.currentY += 6;
        });
      } else {
        // No links - render normally
        lines.forEach(line => {
          this.doc.text(line, x, this.currentY);
          this.currentY += 6;
        });
      }
    } else {
      this.doc.text(text, x, this.currentY);
    }

    this.currentY += spacing;

    // Reset color
    this.doc.setTextColor(...PdfStyles.COLOR_BLACK);
  }

  /**
   * Add bulleted list
   */
  addBulletList(items, options = {}) {
    const { indent = 3, itemSpacing = 5 } = options;

    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_NORMAL);
    this.doc.setFontSize(PdfStyles.MAIN_TEXT_SIZE);

    items.forEach(item => {
      const lines = this.doc.splitTextToSize(item, this.pageWidth - 2 * PdfStyles.MARGIN_WIDTH - indent - 2);
      lines.forEach((line, idx) => {
        const x = PdfStyles.MARGIN_WIDTH + indent + (idx === 0 ? 0 : 2);
        this.doc.text(line, x, this.currentY);
        this.currentY += 4;
      });
      this.currentY += (itemSpacing - 4);
    });
  }

  /**
   * Add numbered list
   */
  addNumberedList(items, options = {}) {
    const { indent = 2, itemSpacing = 5 } = options;

    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_NORMAL);
    this.doc.setFontSize(PdfStyles.MAIN_TEXT_SIZE);

    items.forEach(item => {
      this.doc.text(item, PdfStyles.MARGIN_WIDTH + indent, this.currentY);
      this.currentY += itemSpacing;
    });
  }

  /**
   * Add two side-by-side parent response boxes
   */
  addParentResponseBoxes(height = 60) {
    // Check if box will overflow into footer
    const maxY = this.pageHeight - PdfStyles.FOOTER_HEIGHT - 5;
    if (this.currentY + height > maxY) {
      height = Math.max(20, maxY - this.currentY); // Reduce height to fit
    }

    const boxWidth = (this.pageWidth - 3 * PdfStyles.MARGIN_WIDTH) / 2;
    const rightBoxX = PdfStyles.MARGIN_WIDTH + boxWidth + PdfStyles.MARGIN_WIDTH;

    // Left box
    this.doc.setDrawColor(...PdfStyles.COLOR_BLACK);
    this.doc.setLineWidth(0.2); // Thinner lines
    this.doc.rect(PdfStyles.MARGIN_WIDTH, this.currentY, boxWidth, height);

    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_NORMAL);
    this.doc.setFontSize(PdfStyles.SMALL_TEXT_SIZE);
    this.doc.text('Parent name:', PdfStyles.MARGIN_WIDTH + 3, this.currentY + 4);

    // Right box
    this.doc.rect(rightBoxX, this.currentY, boxWidth, height);
    this.doc.text('Parent name:', rightBoxX + 3, this.currentY + 4);

    this.currentY += height + 6;
  }

  /**
   * Add compromise box
   */
  addCompromiseBox(height = 80) {
    this.addBodyText('You can use this space to write your agreed compromise for this question.', { spacing: 2 }); // Reduced spacing to bring text closer to box

    // Check if box will overflow into footer
    const maxY = this.pageHeight - PdfStyles.FOOTER_HEIGHT - 5;
    if (this.currentY + height > maxY) {
      height = Math.max(30, maxY - this.currentY); // Reduce height to fit
    }

    this.doc.setDrawColor(...PdfStyles.COLOR_BLACK);
    this.doc.setLineWidth(0.2); // Thinner lines
    this.doc.rect(
      PdfStyles.MARGIN_WIDTH,
      this.currentY,
      this.pageWidth - 2 * PdfStyles.MARGIN_WIDTH,
      height
    );

    this.currentY += height + 6;
  }

  /**
   * Add instruction text for parent boxes
   */
  addParentBoxInstruction() {
    const text = 'Enter your name and response to this question in one of the boxes. The other parent should enter their response in the other box.';
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * PdfStyles.MARGIN_WIDTH);

    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_NORMAL);
    this.doc.setFontSize(PdfStyles.MAIN_TEXT_SIZE);

    lines.forEach(line => {
      this.doc.text(line, PdfStyles.MARGIN_WIDTH, this.currentY);
      this.currentY += 4;
    });
    this.currentY += 5;
  }

  /**
   * Add gray info box with content
   */
  addInfoBox(content, height = 55) {
    const boxX = PdfStyles.MARGIN_WIDTH - 1;
    const boxY = this.currentY;
    const boxW = this.pageWidth - 2 * PdfStyles.MARGIN_WIDTH + 2;

    // Draw gray background
    this.doc.setFillColor(...PdfStyles.COLOR_LIGHT_GRAY);
    this.doc.rect(boxX, boxY, boxW, height, 'F');

    // Render content on top of gray box
    this.currentY = boxY + 3;
    this.doc.setTextColor(...PdfStyles.COLOR_BLACK);
    content(boxX + 3, boxW);

    this.currentY = boxY + height + 5; // Increased from 3 to 5 for more spacing below box
  }

  /**
   * Add a single input box
   */
  addInputBox(height = 12, label = null, helperText = null, boldLabel = false) {
    const boxWidth = this.pageWidth - 2 * PdfStyles.MARGIN_WIDTH;

    if (label) {
      this.doc.setFont(PdfStyles.FONT_FAMILY, boldLabel ? PdfStyles.FONT_BOLD : PdfStyles.FONT_NORMAL);
      this.doc.setFontSize(PdfStyles.MAIN_TEXT_SIZE);
      this.doc.setTextColor(...PdfStyles.COLOR_BLACK);
      this.doc.text(label, PdfStyles.MARGIN_WIDTH, this.currentY);
      this.currentY += 4;
    }

    if (helperText) {
      this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_NORMAL);
      this.doc.setFontSize(PdfStyles.SMALL_TEXT_SIZE);
      this.doc.setTextColor(...PdfStyles.COLOR_GRAY);
      this.doc.text(helperText, PdfStyles.MARGIN_WIDTH, this.currentY);
      this.currentY += 3;
      this.doc.setTextColor(...PdfStyles.COLOR_BLACK);
    }

    this.doc.setDrawColor(...PdfStyles.COLOR_BLACK);
    this.doc.setLineWidth(0.2); // Thinner lines
    this.doc.rect(PdfStyles.MARGIN_WIDTH, this.currentY, boxWidth, height);
    this.currentY += height + 6;
  }

  /**
   * Add 2x2 grid of child name boxes
   */
  addChildNameGrid() {
    const boxWidth = (this.pageWidth - 3 * PdfStyles.MARGIN_WIDTH) / 2;
    const boxHeight = 12; // Reduced from 20 to make boxes 2 lines tall
    const rightBoxX = PdfStyles.MARGIN_WIDTH + boxWidth + PdfStyles.MARGIN_WIDTH;

    const children = [
      { label: 'Child 1 (first name)', x: PdfStyles.MARGIN_WIDTH },
      { label: 'Child 2 (first name)', x: rightBoxX },
      { label: 'Child 3 (first name)', x: PdfStyles.MARGIN_WIDTH },
      { label: 'Child 4 (first name)', x: rightBoxX },
    ];

    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_NORMAL);
    this.doc.setFontSize(PdfStyles.SMALL_TEXT_SIZE);
    this.doc.setDrawColor(...PdfStyles.COLOR_BLACK);
    this.doc.setLineWidth(0.2); // Thinner lines

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      // Label above box (removed trailing space)
      this.doc.text(child.label, child.x + 3, this.currentY - 2);

      // Box
      this.doc.rect(child.x, this.currentY, boxWidth, boxHeight);

      // Move down after every 2 boxes
      if (i % 2 === 1) {
        this.currentY += boxHeight + 8;
      }
    }
  }

  /**
   * Add tip text
   */
  addTip(text) {
    this.doc.setFont(PdfStyles.FONT_FAMILY, PdfStyles.FONT_BOLD);
    this.doc.setFontSize(PdfStyles.MAIN_TEXT_SIZE);
    this.doc.setTextColor(...PdfStyles.COLOR_BLACK);

    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * PdfStyles.MARGIN_WIDTH);
    lines.forEach(line => {
      this.doc.text(line, PdfStyles.MARGIN_WIDTH, this.currentY);
      this.currentY += 4;
    });
    this.currentY += 1;
  }

  /**
   * Set document properties
   */
  setProperties(properties) {
    this.doc.setProperties(properties);
  }

  /**
   * Get the PDF output as array buffer
   */
  output(type = 'arraybuffer') {
    return this.doc.output(type);
  }

  /**
   * Add spacing
   */
  addSpacing(amount = 5) {
    this.currentY += amount;
  }
}

module.exports = PdfGenerator;
