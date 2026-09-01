// Extracts text from an uploaded document so it can become citable
// SourceDocument.extractedText for generation. Scope boundary, explicit:
// plain text and PDF are supported; DOCX and other binary formats are not
// wired up yet (would need a real dependency decision — mammoth or
// similar — not added speculatively). Unsupported formats come back with
// supported: false so the caller can mark the SourceDocument 'failed'
// rather than silently pretending extraction succeeded.

import pdfParse from 'pdf-parse';

const PLAIN_TEXT_MIME_TYPES = new Set(['text/plain', 'text/csv', 'text/markdown']);

export interface ITextExtractionResult {
  text: string;
  supported: boolean;
}

export async function extractText(buffer: Buffer, mimeType: string): Promise<ITextExtractionResult> {
  if (PLAIN_TEXT_MIME_TYPES.has(mimeType)) {
    return { text: buffer.toString('utf-8'), supported: true };
  }

  if (mimeType === 'application/pdf') {
    try {
      const result = await pdfParse(buffer);
      return { text: result.text || '', supported: true };
    } catch {
      return { text: '', supported: false };
    }
  }

  return { text: '', supported: false };
}
