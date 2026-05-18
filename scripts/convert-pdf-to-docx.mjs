import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pdfPath = path.join(root, 'Wahid Ur Rehman.pdf');
const docxPath = path.join(root, 'Wahid_Ur_Rehman_Resume.docx');

function toParagraphs(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const isHeading =
        line.length < 60 &&
        (/^[A-Z][A-Za-z\s|&]+$/.test(line) ||
          /^(experience|education|skills|projects|summary|contact)/i.test(line));

      if (isHeading) {
        return new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: line, bold: true })],
        });
      }

      const isBullet = /^[-•*]\s+/.test(line) || /^\d+\.\s+/.test(line);
      const cleanLine = line.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '');

      return new Paragraph({
        bullet: isBullet ? { level: 0 } : undefined,
        spacing: { after: 80 },
        children: [new TextRun({ text: cleanLine })],
      });
    });
}

const buffer = fs.readFileSync(pdfPath);
const parser = new PDFParse({ data: buffer });
const { text } = await parser.getText();
await parser.destroy();
const paragraphs = toParagraphs(text);

if (!paragraphs.length) {
  throw new Error('No text extracted from PDF.');
}

const doc = new Document({
  sections: [{ children: paragraphs }],
});

const docxBuffer = await Packer.toBuffer(doc);
fs.writeFileSync(docxPath, docxBuffer);
console.log(`Created ${docxPath} (${docxBuffer.length} bytes)`);
