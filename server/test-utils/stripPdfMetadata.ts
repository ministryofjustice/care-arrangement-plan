function stripPdfMetadata(pdfBuffer: Buffer) {
  const pdfText = pdfBuffer.toString('latin1')
  return pdfText.replace(/\/CreationDate\s+\(D:\d+-\d+'\d+'\)/g, '').replace(/\/ID\s+\[\s+<.+?>\s+<.+?>\s+]/g, '')
}

export default stripPdfMetadata
