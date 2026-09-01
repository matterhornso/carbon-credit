import { ISourceDocumentInterface } from './sourceDocumentInterface';

export class CreateSourceDocument implements ISourceDocumentInterface {
  projectId!: string;
  filename!: string;
  storageRef!: string;
  mimeType!: string;
  sizeBytes!: number;
  uploadedByUserId!: string;
  status!: string;
  linkedSections!: string[];

  constructor(doc: ISourceDocumentInterface) {
    if (!doc.projectId) throw new Error('projectId missing!');
    if (!doc.filename) throw new Error('filename missing!');
    if (!doc.storageRef) throw new Error('storageRef missing!');
    if (!doc.mimeType) throw new Error('mimeType missing!');
    if (!doc.uploadedByUserId) throw new Error('uploadedByUserId missing!');
    this.projectId = doc.projectId as string;
    this.filename = doc.filename;
    this.storageRef = doc.storageRef;
    this.mimeType = doc.mimeType;
    this.sizeBytes = doc.sizeBytes || 0;
    this.uploadedByUserId = doc.uploadedByUserId;
    this.status = doc.status || 'uploaded';
    this.linkedSections = doc.linkedSections || [];
  }
}
