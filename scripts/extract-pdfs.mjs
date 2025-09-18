import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extract(filePath){
  const abs = path.resolve(filePath);
  const loadingTask = pdfjsLib.getDocument({ url: abs, verbosity: 0, useSystemFonts: true, isEvalSupported: false });
  const doc = await loadingTask.promise;
  let text = '';
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items.map(i => (i.str || '')).join(' ');
    text += `\n\n--- Page ${p}/${doc.numPages} ---\n` + strings;
  }
  return text;
}

const files = [
  '../NFPA 70B breakdown .pdf',
  '../Proposal# 500000027 Merrimack YMCA NFPA 70B.docx.pdf'
];

for (const f of files){
  try {
    const t = await extract(f);
    console.log('===== FILE:', f, '=====');
    console.log(t);
  } catch (e) {
    console.log('===== FILE:', f, '=====' );
    console.log('__ERROR__', e.message);
  }
}
