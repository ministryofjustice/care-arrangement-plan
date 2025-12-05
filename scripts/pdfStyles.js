/**
 * PDF styling constants
 * Matches server/constants/pdfConstants.ts for consistency
 */

const PdfStyles = {
  // Layout constants (matching TypeScript version)
  HEADER_HEIGHT: 22.4, // mm
  HEADER_LOGO_HEIGHT: 8, // mm
  FOOTER_HEIGHT: 22.4, // mm
  MARGIN_WIDTH: 10, // mm
  PAGE_WIDTH_MM: 210, // A4
  PAGE_HEIGHT_MM: 297, // A4
  LINE_HEIGHT_RATIO: 1.5,
  MM_PER_POINT: 0.352778,
  PARAGRAPH_SPACE: 5,

  // Font sizes (matching screenshot formatting)
  MAIN_PAGE_HEADING_SIZE: 48, // pt - for first page main heading
  SECTION_HEADING_SIZE: 32, // pt - for major sections
  SUBSECTION_HEADING_SIZE: 19, // pt - for subsections
  QUESTION_TITLE_SIZE: 19, // pt - for questions
  MAIN_TEXT_SIZE: 16, // pt - for body text
  SMALL_TEXT_SIZE: 14, // pt - for helper text
  INFO_BOX_TEXT_SIZE: 14, // pt - for info boxes
  HINT_TEXT_SIZE: 14, // pt - for gray helper text

  // Colors
  COLOR_BLACK: [0, 0, 0],
  COLOR_WHITE: [255, 255, 255],
  COLOR_GRAY: [100, 100, 100],
  COLOR_LIGHT_GRAY: [200, 200, 200],
  COLOR_BORDER_GRAY: [180, 180, 180],

  // Font styles
  FONT_NORMAL: 'normal',
  FONT_BOLD: 'bold',

  // Fonts
  FONT_FAMILY: 'Helvetica',
};

module.exports = PdfStyles;
