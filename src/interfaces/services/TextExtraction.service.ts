// Extracts text from an uploaded document so it can become citable
// SourceDocument.extractedText for generation.
//
// Two things this deliberately does beyond parsing:
//
// 1. It sniffs the file signature rather than trusting the declared MIME
//    type. Browsers and operating systems routinely send DOCX uploads as
//    application/octet-stream, and a document rejected on a bad content-type
//    header is a document the customer believes they supplied.
// 2. It reports *why* a file yielded nothing. A scanned PDF parses fine and
//    returns an empty string — without a reason that reads as a successful
//    upload and the evidence is silently absent from every section that
//    should have cited it.

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const PLAIN_TEXT_MIME_TYPES = new Set([
  'text/plain', 'text/csv', 'text/markdown', 'application/json', 'text/html',
]);

const DOCX_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

// Content-types that carry no information — sniff these rather than reject.
const AMBIGUOUS_MIME_TYPES = new Set([
  'application/octet-stream', 'application/binary', 'application/download', '',
]);

export interface ITextExtractionResult {
  /** Extracted text; empty when nothing could be read. */
  text: string;
  /** Whether the format itself could be parsed. */
  supported: boolean;
  /** Why the result is unusable, in words a customer can act on. */
  reason?: string;
}

type Format = 'pdf' | 'docx' | 'legacy-doc' | 'zip' | 'text' | 'unknown';

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((b, i) => buffer[i] === b);
}

/** Identify by content. Signatures beat declared content-types, which lie. */
function sniff(buffer: Buffer): Format {
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46])) return 'pdf';            // %PDF
  if (startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0])) return 'legacy-doc';     // OLE2 compound file
  if (startsWith(buffer, [0x50, 0x4b, 0x03, 0x04])) {                        // ZIP container
    // A DOCX is a ZIP holding word/document.xml. Checking for that entry name
    // in the raw bytes distinguishes it from an XLSX or an ordinary archive
    // without paying to decompress the whole thing.
    return buffer.includes(Buffer.from('word/document.xml')) ? 'docx' : 'zip';
  }
  return 'unknown';
}

function resolveFormat(buffer: Buffer, mimeType: string): Format {
  const declared = (mimeType || '').toLowerCase().split(';')[0].trim();
  const sniffed = sniff(buffer);

  // A trustworthy signature always wins: a DOCX sent as octet-stream is still
  // a DOCX, and a .txt renamed to .pdf is still text.
  if (sniffed !== 'unknown') return sniffed;
  if (PLAIN_TEXT_MIME_TYPES.has(declared)) return 'text';
  if (DOCX_MIME_TYPES.has(declared)) return 'docx';
  if (declared === 'application/pdf') return 'pdf';
  if (declared === 'application/msword') return 'legacy-doc';
  if (AMBIGUOUS_MIME_TYPES.has(declared)) return 'unknown';
  return 'unknown';
}

const NO_TEXT_PDF =
  'The file was read but contains no text layer — it is most likely a scan or a set of images. ' +
  'Optical character recognition is not supported, so re-upload a text-based version if this ' +
  'document needs to be cited.';

const NO_TEXT_DOCX =
  'The document was read but contains no text — it may hold only images, or be empty.';

export async function extractText(buffer: Buffer, mimeType: string): Promise<ITextExtractionResult> {
  if (!buffer || buffer.length === 0) {
    return { text: '', supported: false, reason: 'The file is empty.' };
  }

  switch (resolveFormat(buffer, mimeType)) {
    case 'text': {
      const text = buffer.toString('utf-8');
      return text.trim().length > 0
        ? { text, supported: true }
        : { text: '', supported: true, reason: 'The file contains no text.' };
    }

    case 'pdf': {
      try {
        const result = await pdfParse(buffer);
        const text = result.text || '';
        return text.trim().length > 0
          ? { text, supported: true }
          : { text: '', supported: true, reason: NO_TEXT_PDF };
      } catch (error: any) {
        return { text: '', supported: false, reason: `The PDF could not be read: ${error?.message || 'unknown error'}.` };
      }
    }

    case 'docx': {
      try {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value || '';
        return text.trim().length > 0
          ? { text, supported: true }
          : { text: '', supported: true, reason: NO_TEXT_DOCX };
      } catch (error: any) {
        return { text: '', supported: false, reason: `The Word document could not be read: ${error?.message || 'unknown error'}.` };
      }
    }

    case 'legacy-doc':
      return {
        text: '', supported: false,
        reason: 'This is a legacy .doc file, which is a different format from .docx and is not supported. ' +
                'Open it in Word and save as .docx, then upload again.',
      };

    case 'zip':
      return {
        text: '', supported: false,
        reason: 'This looks like an archive rather than a document. Upload the individual files instead.',
      };

    default:
      return {
        text: '', supported: false,
        reason: `Text extraction is not supported for ${mimeType || 'this file type'}. ` +
                'Supported formats are PDF, Word (.docx), and plain text.',
      };
  }
}
