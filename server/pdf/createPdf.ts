import Pdf from './pdf'

const createPdf = (autoPrint: boolean) => {
  const pdf = new Pdf(autoPrint)

  pdf.createDoYouAgreeComponent(
    'About this child arrangements proposal',
    undefined,
    'Lara said:\n•   there is no court order in place at this time\n•   this is a proposed child arrangements plan for 2 children, Annie and Billy\n•   this agreement is between Lara and Ian, who are the adults who will care for Annie and Billy',
    'We do not store these names or share any of this information with other government departments.',
    false,
  )
  pdf.createDoYouAgreeComponent(
    'Living and visiting',
    'Where will the children mostly live?',
    "Lara has suggested that the children mostly live at Lara's home.",
    'If you do not agree, suggest where the children will mostly live',
    true,
  )
  pdf.createDoYouAgreeComponent(
    undefined,
    'Will the children stay overnight with Ian?',
    'Lara has suggested that the children stay overnight with Ian every week.',
    'If you do not agree, suggest what should happen about overnight visits',
    true,
  )
  pdf.createDoYouAgreeComponent(
    undefined,
    'Will the children stay overnight with Ian?',
    'Lara has suggested that the children stay overnight with Ian every week.',
    'If you do not agree, suggest what should happen about overnight visits',
    true,
  )
  pdf.addHeaderToEveryPage()

  return pdf.toArrayBuffer()
}

export default createPdf
