const fs = require('fs');
const path = require('path');

const generatePdf = require('../../../scripts/generatePdf');

describe('PDF Generator Integration Tests', () => {
  const sourceOutputPath = path.resolve(__dirname, '../../../assets/other/paperForm.pdf');
  const distOutputPath = path.resolve(__dirname, '../../../dist/assets/other/paperForm.pdf');

  // Clean up generated PDFs before tests
  beforeAll(() => {
    [sourceOutputPath, distOutputPath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  describe('PDF Generation', () => {
    it('should generate PDF without errors', () => {
      expect(() => {
        generatePdf();
      }).not.toThrow();
    });

    it('should create PDF file in source assets directory', () => {
      generatePdf();
      expect(fs.existsSync(sourceOutputPath)).toBe(true);
    });

    it('should create PDF file in dist assets directory', () => {
      generatePdf();
      expect(fs.existsSync(distOutputPath)).toBe(true);
    });

    it('should generate a PDF with reasonable file size', () => {
      generatePdf();
      const stats = fs.statSync(sourceOutputPath);

      // PDF should be larger than 50KB (contains content)
      expect(stats.size).toBeGreaterThan(50000);

      // PDF should be smaller than 5MB (not bloated)
      expect(stats.size).toBeLessThan(5000000);
    });

    it('should generate a valid PDF file with correct header', () => {
      generatePdf();
      const pdfBuffer = fs.readFileSync(sourceOutputPath);

      // Check PDF magic number (first 4 bytes should be "%PDF")
      const pdfHeader = pdfBuffer.toString('utf8', 0, 4);
      expect(pdfHeader).toBe('%PDF');
    });

    it('should generate a PDF with version 1.3 or higher', () => {
      generatePdf();
      const pdfBuffer = fs.readFileSync(sourceOutputPath);

      // Check PDF version in header (e.g., %PDF-1.3, %PDF-1.4, etc.)
      const pdfVersion = pdfBuffer.toString('utf8', 0, 10);
      expect(pdfVersion).toMatch(/%PDF-1\.[3-7]/);
    });

    it('should generate identical PDFs in both locations', () => {
      generatePdf();

      const sourceBuffer = fs.readFileSync(sourceOutputPath);
      const distBuffer = fs.readFileSync(distOutputPath);

      // Both files should be identical
      expect(sourceBuffer.equals(distBuffer)).toBe(true);
    });

    it('should have proper PDF end-of-file marker', () => {
      generatePdf();
      const pdfBuffer = fs.readFileSync(sourceOutputPath);

      // Check last 10 bytes for %%EOF marker
      const endMarker = pdfBuffer.toString('utf8', pdfBuffer.length - 10, pdfBuffer.length);
      expect(endMarker).toContain('%%EOF');
    });
  });

  describe('PDF Directories', () => {
    it('should create source assets directory if it does not exist', () => {
      const sourceDir = path.dirname(sourceOutputPath);

      // Remove directory if it exists
      if (fs.existsSync(sourceDir)) {
        fs.rmSync(sourceDir, { recursive: true });
      }

      generatePdf();

      expect(fs.existsSync(sourceDir)).toBe(true);
      expect(fs.existsSync(sourceOutputPath)).toBe(true);
    });

    it('should create dist assets directory if it does not exist', () => {
      const distDir = path.dirname(distOutputPath);

      // Remove directory if it exists
      if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true });
      }

      generatePdf();

      expect(fs.existsSync(distDir)).toBe(true);
      expect(fs.existsSync(distOutputPath)).toBe(true);
    });
  });

  describe('PDF File Properties', () => {
    it('should be a readable file', () => {
      generatePdf();

      expect(() => {
        fs.accessSync(sourceOutputPath, fs.constants.R_OK);
      }).not.toThrow();
    });

    it('should have consistent file size on regeneration', () => {
      generatePdf();
      const firstSize = fs.statSync(sourceOutputPath).size;

      // Regenerate
      generatePdf();
      const secondSize = fs.statSync(sourceOutputPath).size;

      // File size should be consistent (allowing small variance for timestamps)
      expect(Math.abs(firstSize - secondSize)).toBeLessThan(1000);
    });
  });

  // Clean up after all tests
  afterAll(() => {
    // Keep the generated PDFs for manual inspection if needed - comment out the following lines
    [sourceOutputPath, distOutputPath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });
});
