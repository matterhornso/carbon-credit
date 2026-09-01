import { Types } from 'mongoose';

// One CaseDocument per Project. `sections` is an array keyed by a `key`
// string (matching Methodology.sectionGuidance[].section) rather than fixed
// named fields — a new methodology never needs a new CaseDocument shape,
// only new seed data driving which section keys get created.
export interface ICaseDocumentInterface {
  projectId?: Types.ObjectId | string;
  sections?: ICaseSection[];
}

export interface ICaseSection {
  key: string;
  status: string; // 'not_started' | 'ai_drafting' | 'draft_ready' | 'user_edited' | 'finalized'
  content?: any;
  sourceCitations?: string[];
  generationHistory?: IGenerationEvent[];
  lastEditedByUserId?: string;
  lastEditedAt?: Date;
  // Contradiction-detection findings (uploaded source vs. structured intake)
  // surfaced separately from citations so the UI can flag them distinctly.
  warnings?: string[];
}

export interface IGenerationEvent {
  prompt: string;
  response: string;
  model: string;
  createdAt?: Date;
}
