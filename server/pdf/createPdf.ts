import { Request } from 'express'
import Pdf from './pdf'
import addPreamble from './addPreamble'
import addWhatHappensNow from './addWhatHappensNow'

const createPdf = (autoPrint: boolean, request: Request) => {
  const pdf = new Pdf(autoPrint)

  addPreamble(pdf, request)
  pdf.createNewPage()

  addWhatWillHappen(pdf, request)
  addWhatHappensNow(pdf, request)

  pdf.addFooterToEveryPage()

  return pdf.toArrayBuffer()
}

export default createPdf
