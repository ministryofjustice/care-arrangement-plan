import { Router } from 'express'
import paths from '../constants/paths'
import createPdf from '../pdf/createPdf'

const pdfRoutes = (router: Router) => {
  router.get(paths.DOWNLOAD_PDF, (request, response) => {
    const pdf = createPdf(false)

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', 'attachment; filename=Proposed child arrangements plan.pdf')
    response.send(Buffer.from(pdf))
  })

  router.get(paths.PRINT_PDF, (request, response) => {
    const pdf = createPdf(true)

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', 'inline; filename=Proposed child arrangements plan.pdf')
    response.send(Buffer.from(pdf))
  })
}

export default pdfRoutes
