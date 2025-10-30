import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

export const stripPdfMetadata = (pdfBuffer: Buffer) => {
  const pdfText = pdfBuffer.toString('latin1');
  return pdfText
    .replace(/\/CreationDate\s+\(D:[^)]+\)/g, '')
    .replace(/\/ModDate\s+\(D:[^)]+\)/g, '')
    .replace(/\/ID\s+\[\s*<[^>]+>\s*<[^>]+>\s*\]/gs, '')
    .replace(/\/Producer\s+\([^)]+\)/g, '')
    .replace(/\/Creator\s+\([^)]+\)/g, '')
    .replace(/\/Title\s+\([^)]+\)/g, '')
    .replace(/\/Author\s+\([^)]+\)/g, '')
    .replace(/\/Subject\s+\([^)]+\)/g, '')
    .replace(/\/Keywords\s+\([^)]+\)/g, '');
};

export const validateResponseAgainstSnapshot = (response: Buffer, snapshotName: string) => {
  const responseHash = createHash('sha256').update(stripPdfMetadata(response)).digest('hex');

  // Use process.cwd() to get the project root directory
  const projectRoot = process.cwd();
  const snapshotPath = path.join(projectRoot, snapshotName);

  const referenceFile = fs.readFileSync(snapshotPath);
  const referenceHash = createHash('sha256').update(stripPdfMetadata(referenceFile)).digest('hex');

  try {
    expect(responseHash).toEqual(referenceHash);
  } catch (error) {
    if (process.env.UPDATE_PDF_SNAPSHOTS) {
      fs.writeFileSync(snapshotPath, response);
    } else {
      throw error;
    }
  }
};
