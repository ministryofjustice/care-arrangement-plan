import { PdfBuilder } from '../../@types/pdf'

abstract class Base {
  protected readonly pdf: PdfBuilder

  protected constructor(pdf: PdfBuilder) {
    this.pdf = pdf
  }

  addComponentToDocument() {
    if (this.pdf.heightWillOverflowDocument(this.getComponentHeight())) {
      this.handleComponentOverflowingPage()
    } else {
      this.createComponent()
    }
  }

  protected abstract handleComponentOverflowingPage(): void

  protected abstract getComponentHeight(): number

  protected abstract createComponent(): void
}

export default Base
