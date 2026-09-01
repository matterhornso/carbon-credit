import { ISourceDocumentInterface } from './sourceDocumentInterface';
import { CreateSourceDocument } from './CreateSourceDocument';
import { SourceDocumentUseCase } from '../../application/usecases/index';

export class SourceDocument {
  create(doc: ISourceDocumentInterface, useCase: SourceDocumentUseCase) {
    let createSourceDocument = new CreateSourceDocument(doc);
    return useCase.createSourceDocument(createSourceDocument);
  }
}
