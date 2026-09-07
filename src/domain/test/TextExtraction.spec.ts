// Exercises the real extraction path, including mammoth, by building a valid
// DOCX in memory rather than committing a binary fixture — a fixture cannot be
// reviewed in a diff, and one that drifts from what Word actually produces
// tests nothing useful.

import { expect } from 'chai';
import JSZip from 'jszip';
import { extractText } from '../../interfaces/services/TextExtraction.service';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

async function buildDocx(paragraphs: string[]): Promise<Buffer> {
  const zip = new JSZip();
  zip.file('[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  zip.folder('_rels')!.file('.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  const body = paragraphs.map((p) => `<w:p><w:r><w:t xml:space="preserve">${p}</w:t></w:r></w:p>`).join('');
  zip.folder('word')!.file('document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`);
  return zip.generateAsync({ type: 'nodebuffer' });
}

describe('Test extractText', () => {

  describe('Word documents', () => {

    it('extracts the text of a real .docx', async () => {
      const buffer = await buildDocx([
        'Grid connection is at 132kV.',
        'The metering point is at the substation boundary.',
      ]);
      const result = await extractText(buffer, DOCX_MIME);

      expect(result.supported).equals(true);
      expect(result.text).to.contain('132kV');
      expect(result.text).to.contain('substation boundary');
      expect(result.reason).to.equal(undefined);
    });

    // Browsers and operating systems frequently send .docx as octet-stream.
    // Rejecting on the declared type loses evidence the customer did supply.
    it('extracts a .docx that arrives with a generic content type', async () => {
      const buffer = await buildDocx(['Baseline emission factor is 0.82 tCO2/MWh.']);
      const result = await extractText(buffer, 'application/octet-stream');

      expect(result.supported).equals(true);
      expect(result.text).to.contain('0.82');
    });

    it('extracts a .docx even when the content type is wrong', async () => {
      const buffer = await buildDocx(['Land title reference AB/1234.']);
      const result = await extractText(buffer, 'application/pdf');

      expect(result.supported).equals(true);
      expect(result.text).to.contain('AB/1234');
    });

    it('flags a .docx that contains no text instead of reporting success', async () => {
      const buffer = await buildDocx([]);
      const result = await extractText(buffer, DOCX_MIME);

      expect(result.text.trim()).equals('');
      expect(result.reason, 'an empty document must explain itself').to.be.a('string');
    });

  });

  describe('formats that cannot be read', () => {

    it('tells the user what to do about a legacy .doc', async () => {
      // OLE2 compound-file signature, which is what a real .doc starts with.
      const buffer = Buffer.concat([
        Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
        Buffer.alloc(64),
      ]);
      const result = await extractText(buffer, 'application/msword');

      expect(result.supported).equals(false);
      expect(result.reason).to.match(/\.docx/);
      expect(result.reason, 'the reason should be actionable').to.match(/save as/i);
    });

    it('distinguishes an ordinary archive from a Word document', async () => {
      const zip = new JSZip();
      zip.file('notes.txt', 'not a word document');
      const buffer = await zip.generateAsync({ type: 'nodebuffer' });
      const result = await extractText(buffer, 'application/zip');

      expect(result.supported).equals(false);
      expect(result.reason).to.match(/archive/i);
    });

    it('names the supported formats for anything else', async () => {
      const result = await extractText(Buffer.from([0x00, 0x01, 0x02, 0x03]), 'image/png');

      expect(result.supported).equals(false);
      expect(result.reason).to.match(/PDF/);
      expect(result.reason).to.match(/docx/);
    });

    it('rejects an empty file', async () => {
      const result = await extractText(Buffer.alloc(0), DOCX_MIME);
      expect(result.supported).equals(false);
      expect(result.reason).to.match(/empty/i);
    });

    it('reports a corrupt PDF rather than throwing', async () => {
      const buffer = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.from('not actually a pdf')]);
      const result = await extractText(buffer, 'application/pdf');

      expect(result.supported).equals(false);
      expect(result.reason).to.match(/PDF could not be read/);
    });

  });

  describe('plain text', () => {

    it('reads a text file', async () => {
      const result = await extractText(Buffer.from('Survey of 240 households.', 'utf-8'), 'text/plain');
      expect(result.supported).equals(true);
      expect(result.text).to.contain('240 households');
    });

    it('flags a whitespace-only file rather than treating it as evidence', async () => {
      const result = await extractText(Buffer.from('   \n\n  ', 'utf-8'), 'text/plain');
      expect(result.text.trim()).equals('');
      expect(result.reason).to.be.a('string');
    });

  });

});
