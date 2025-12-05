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

    // Add footer on first page
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(MAIN_TEXT_SIZE);
    const pageCountText = `1 of ${doc.getNumberOfPages()}`;
    doc.text(
      pageCountText,
      pageWidth - MARGIN_WIDTH,
      pageHeight - MARGIN_WIDTH,
      { align: 'right' }
    );

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
