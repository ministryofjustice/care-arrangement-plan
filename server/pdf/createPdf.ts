import { Request } from 'express'
import Pdf from './pdf'
import addPreamble from './addPreamble'
import addWhatHappensNow from './addWhatHappensNow'
import addSpecialDays from './addSpecialDays'
import addAboutTheProposal from './addAboutTheProposal'
import addLivingAndVisiting from './addLivingAndVisiting'

const createPdf = (autoPrint: boolean, request: Request) => {
  const pdf = new Pdf(autoPrint)

  addPreamble(pdf, request)
  pdf.createNewPage()

  addAboutTheProposal(pdf, request)
  addLivingAndVisiting(pdf, request)
  addSpecialDays(pdf, request)
  addWhatHappensNow(pdf, request)

  pdf.addFooterToEveryPage()

  return pdf.toArrayBuffer()
}

export default createPdf
