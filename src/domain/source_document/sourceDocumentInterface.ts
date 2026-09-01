import { Types } from 'mongoose';

export interface ISourceDocumentInterface {
  projectId?: Types.ObjectId | string;
  filename?: string;
  storageRef?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedByUserId?: string;
  extractedText?: string;
  linkedSections?: string[];
  status?: string; // 'uploaded' | 'processing' | 'processed' | 'failed'
}
