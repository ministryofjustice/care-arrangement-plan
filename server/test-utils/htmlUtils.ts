import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Normalises HTML content for comparison by:
 * - Removing extra whitespace
 * - Normalising line endings
 * - Removing dynamic content that might differ between runs
 */
export const normalizeHtml = (html: string): string => {
  return html
    .replace(/\r\n/g, '\n') // Normalise line endings
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .trim();
};

/**
 * Validates an HTML response against a snapshot file.
 * If UPDATE_HTML_SNAPSHOTS env var is set, updates the snapshot instead of comparing.
 */
export const validateHtmlAgainstSnapshot = (response: string, snapshotName: string) => {
  const normalizedResponse = normalizeHtml(response);
  const responseHash = createHash('sha256').update(normalizedResponse).digest('hex');

  const snapshotPath = path.resolve(__dirname, snapshotName);

  if (!fs.existsSync(snapshotPath) && !process.env.UPDATE_HTML_SNAPSHOTS) {
    throw new Error(`Snapshot file does not exist: ${snapshotPath}. Run with UPDATE_HTML_SNAPSHOTS=1 to create it.`);
  }

  if (fs.existsSync(snapshotPath)) {
    const referenceFile = fs.readFileSync(snapshotPath, 'utf-8');
    const normalizedReference = normalizeHtml(referenceFile);
    const referenceHash = createHash('sha256').update(normalizedReference).digest('hex');

    try {
      expect(responseHash).toEqual(referenceHash);
    } catch (error) {
      if (process.env.UPDATE_HTML_SNAPSHOTS) {
        fs.writeFileSync(snapshotPath, response);
      } else {
        throw error;
      }
    }
  } else if (process.env.UPDATE_HTML_SNAPSHOTS) {
    // Create the directory if it doesn't exist
    const dir = path.dirname(snapshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(snapshotPath, response);
  }
};

/**
 * Basic HTML validation checks
 */
export const validateHtmlStructure = (html: string) => {
  // Check for basic HTML structure
  expect(html).toBeTruthy();
  expect(typeof html).toBe('string');

  // Check that HTML contains basic accessibility elements
  if (html.includes('<section')) {
    expect(html).toMatch(/aria-labelledby=["'][^"']+["']/);
  }

  return true;
};

/**
 * Checks if HTML contains specific content
 */
export const expectHtmlToContain = (html: string, ...contents: string[]) => {
  contents.forEach(content => {
    expect(html).toContain(content);
  });
};

/**
 * Checks if HTML does not contain specific content
 */
export const expectHtmlNotToContain = (html: string, ...contents: string[]) => {
  contents.forEach(content => {
    expect(html).not.toContain(content);
  });
};
