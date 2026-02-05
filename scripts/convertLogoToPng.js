import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../assets/images/govuk-logo-rebrand.svg');
const pngPath = path.join(__dirname, '../assets/images/govuk-logo-rebrand.png');

// Check if conversion is needed
const shouldConvert = () => {
  if (!fs.existsSync(pngPath)) {
    return true; // PNG doesn't exist
  }

  const svgStats = fs.statSync(svgPath);
  const pngStats = fs.statSync(pngPath);

  // Convert if SVG is newer than PNG
  return svgStats.mtime > pngStats.mtime;
};

if (!shouldConvert()) {
  console.log('✓ Logo PNG is up to date, skipping conversion');
  process.exit(0);
}

// Read SVG and convert to PNG
const svgBuffer = fs.readFileSync(svgPath);

sharp(svgBuffer)
  .resize(162, 30)
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log('✓ Logo converted to PNG successfully');
  })
  .catch(err => {
    console.error('Error converting logo to PNG:', err);
    process.exit(1);
  });
