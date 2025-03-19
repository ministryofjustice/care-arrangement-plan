import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

export const stripPdfMetadata = (pdfBuffer: Buffer) => {
  const pdfText = pdfBuffer.toString('latin1');
  return pdfText
    .replace(/\/CreationDate\s+\(D:\d+-\d+'\d+'\)/g, '')
    .replace(/\/ID\s+\[\s+<.+?>\s+<.+?>\s+]/g, '')
    .replace(/\/Producer\s+\(\w+\s\d+\.\d+\.\d+\)/g, '');
};

export const validateResponseAgainstSnapshot = (response: Buffer, snapshotName: string) => {
  if (process.env.UPDATE_PDF_SNAPSHOTS) {
    fs.writeFileSync(path.resolve(__dirname, snapshotName), response);
  }

  const responseHash = createHash('sha256').update(stripPdfMetadata(response)).digest('hex');

  const referenceFile = fs.readFileSync(path.resolve(__dirname, snapshotName));
  const referenceHash = createHash('sha256').update(stripPdfMetadata(referenceFile)).digest('hex');

  expect(responseHash).toEqual(referenceHash);
};
