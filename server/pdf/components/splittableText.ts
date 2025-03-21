import { Paragraph, PdfBuilder } from '../../@types/pdf';
import { LINE_HEIGHT_RATIO, MM_PER_POINT } from '../../constants/pdfConstants';
import logger from '../../logger';

type SplittableParagraph = Paragraph & { splittable?: boolean };
type PotentialNewPageParagraph = Paragraph & { canStartNewPage?: boolean };

class SplittableText {
  protected readonly pdf: PdfBuilder;
  private readonly paragraphs: SplittableParagraph[];

  private stagedParagraphsHeight = 0;
  private stagedParagraphsToAdd: Paragraph[] = [];

  private readonly MIN_LINES_OF_TEXT = 3;

  constructor(pdf: PdfBuilder, paragraphs: SplittableParagraph[]) {
    this.pdf = pdf;
    this.paragraphs = paragraphs;
  }

  splitParagraph(paragraph: Paragraph) {
    const paragraphs: PotentialNewPageParagraph[] = [];

    const lines: string[] = this.pdf.splitParagraph(paragraph);

    paragraphs.push({
      text: lines.slice(0, this.MIN_LINES_OF_TEXT).join('\n'),
      size: paragraph.size,
      style: paragraph.style,
      bottomPadding: LINE_HEIGHT_RATIO * MM_PER_POINT,
    });
    lines.slice(3, lines.length).forEach((line) => {
      paragraphs.push({
        canStartNewPage: true,
        text: line,
        size: paragraph.size,
        style: paragraph.style,
        bottomPadding: LINE_HEIGHT_RATIO * MM_PER_POINT,
      });
    });
    paragraphs[paragraphs.length - 1].bottomPadding = paragraph.bottomPadding;

    return paragraphs;
  }

  addStagedParagraphsToDocument() {
    if (this.pdf.heightWillOverflowDocument(this.stagedParagraphsHeight)) {
      this.pdf.createNewPage();
    }
    if (this.pdf.heightWillOverflowDocument(this.stagedParagraphsHeight)) {
      logger.error('Creating a PDF with an overflowing page');
    }
    this.stagedParagraphsToAdd.forEach((paragraph) => {
      this.pdf.addParagraph(paragraph);
    });
    this.stagedParagraphsHeight = 0;
    this.stagedParagraphsToAdd = [];
  }

  addParagraphToStaging(paragraph: Paragraph) {
    this.stagedParagraphsHeight += this.pdf.getParagraphHeight(paragraph);
    this.stagedParagraphsToAdd.push(paragraph);
  }

  addComponentToDocument() {
    const splitParagraphs: PotentialNewPageParagraph[] = this.paragraphs.flatMap((paragraph) => {
      if (paragraph.splittable) {
        return this.splitParagraph(paragraph);
      } else {
        return paragraph;
      }
    });

    splitParagraphs.forEach((paragraph) => {
      if (paragraph.canStartNewPage) {
        this.addStagedParagraphsToDocument();
      }
      return this.addParagraphToStaging(paragraph);
    });

    this.addStagedParagraphsToDocument();
  }
}

export default SplittableText;
