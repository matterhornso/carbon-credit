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
  status: string; // 'not_started' | 'ai_drafting' | 'draft_ready' | 'user_edited' | 'finalized' | 'generation_failed'
  content?: any;
  sourceCitations?: string[];
  generationHistory?: IGenerationEvent[];
  lastEditedByUserId?: string;
  lastEditedAt?: Date;
  // Contradiction-detection findings (uploaded source vs. structured intake)
  // surfaced separately from citations so the UI can flag them distinctly.
  warnings?: string[];
  // Failure reason from the last generation attempt, null once it succeeds.
  // Distinct from warnings: a warning is something the model found in the
  // project, this is something that went wrong producing the section.
  lastError?: string | null;
}

export interface IGenerationEvent {
  prompt: string;
  response: string;
  model: string;
  createdAt?: Date;
}
