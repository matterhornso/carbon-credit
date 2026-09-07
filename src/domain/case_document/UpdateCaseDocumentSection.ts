export class UpdateCaseDocumentSection {
  caseDocumentId!: string;
  sectionKey!: string;
  status?: string;
  content?: any;
  sourceCitations?: string[];
  generationHistoryEntry?: { prompt: string; response: string; model: string };
  lastEditedByUserId?: string;
  warnings?: string[];
  lastError?: string | null;

  constructor(data: {
    caseDocumentId: string;
    sectionKey: string;
    status?: string;
    content?: any;
    sourceCitations?: string[];
    generationHistoryEntry?: { prompt: string; response: string; model: string };
    lastEditedByUserId?: string;
    warnings?: string[];
    lastError?: string | null;
  }) {
    if (!data.caseDocumentId) throw new Error('caseDocumentId missing!');
    if (!data.sectionKey) throw new Error('sectionKey missing!');
    this.caseDocumentId = data.caseDocumentId;
    this.sectionKey = data.sectionKey;
    this.status = data.status;
    this.content = data.content;
    this.sourceCitations = data.sourceCitations;
    this.generationHistoryEntry = data.generationHistoryEntry;
    this.lastEditedByUserId = data.lastEditedByUserId;
    this.warnings = data.warnings;
    this.lastError = data.lastError;
  }
}
