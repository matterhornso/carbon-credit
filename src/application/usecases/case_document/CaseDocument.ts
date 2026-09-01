import { CreateCaseDocument } from "../../../domain";
import { UpdateCaseDocumentSection } from "../../../domain/case_document/UpdateCaseDocumentSection";
import { ICaseDocumentRepository } from "../../repositories/ICaseDocumentRepository";

export default class CaseDocument {
  private caseDocumentRepository: ICaseDocumentRepository;
  constructor(caseDocumentRepository: ICaseDocumentRepository) {
    this.caseDocumentRepository = caseDocumentRepository;
  }

  createCaseDocument(caseDocument: CreateCaseDocument) {
    return this.caseDocumentRepository.createCaseDocument(caseDocument);
  }

  updateSection(update: UpdateCaseDocumentSection) {
    return this.caseDocumentRepository.updateSection(update);
  }

  getCaseDocumentByProjectId(projectId: string) {
    return this.caseDocumentRepository.getCaseDocumentByProjectId(projectId);
  }
}
