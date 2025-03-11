import { Request } from 'express'
import Pdf from './pdf'
import addPreamble from './addPreamble'
import addWhatHappensNow from './addWhatHappensNow'
import addSpecialDays from './addSpecialDays'

const createPdf = (autoPrint: boolean, request: Request) => {
  const pdf = new Pdf(autoPrint)

  addPreamble(pdf, request)
  pdf.createNewPage()

  addSpecialDays(pdf, request)

  addWhatHappensNow(pdf, request)

  pdf.addFooterToEveryPage()

  return pdf.toArrayBuffer()
}

export default createPdf
