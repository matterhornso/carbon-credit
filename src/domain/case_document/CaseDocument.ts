import { CreateCaseDocument } from './CreateCaseDocument';
import { UpdateCaseDocumentSection } from './UpdateCaseDocumentSection';
import { CaseDocumentUseCase } from '../../application/usecases/index';

export class CaseDocument {
  create(data: { projectId: string; sectionKeys: string[] }, useCase: CaseDocumentUseCase) {
    let createCaseDocument = new CreateCaseDocument(data);
    return useCase.createCaseDocument(createCaseDocument);
  }

  updateSection(data: {
    caseDocumentId: string;
    sectionKey: string;
    status?: string;
    content?: any;
    sourceCitations?: string[];
    generationHistoryEntry?: { prompt: string; response: string; model: string };
    lastEditedByUserId?: string;
  }, useCase: CaseDocumentUseCase) {
    let updateSection = new UpdateCaseDocumentSection(data);
    return useCase.updateSection(updateSection);
  }
}
