import Pdf from '../pdf';

abstract class Base {
  protected readonly pdf: Pdf;

  protected constructor(pdf: Pdf) {
    this.pdf = pdf;
  }

  addComponentToDocument() {
    if (this.pdf.heightWillOverflowDocument(this.getComponentHeight())) {
      this.handleComponentOverflowingPage();
    } else {
      this.createComponent();
    }
  }

  protected abstract handleComponentOverflowingPage(): void;

  protected abstract getComponentHeight(): number;

  protected abstract createComponent(): void;
}

export default Base;
