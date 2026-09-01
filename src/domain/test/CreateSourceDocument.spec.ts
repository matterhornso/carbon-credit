import { expect } from 'chai';
import { CreateSourceDocument } from '../source_document/CreateSourceDocument';

describe('Test class CreateSourceDocument', () => {

  const validDoc: any = {
    projectId: 'project-1',
    filename: 'land-survey.pdf',
    storageRef: 's3://bucket/land-survey.pdf',
    mimeType: 'application/pdf',
    uploadedByUserId: 'user-1',
  };

  it('defaults status to uploaded', () => {
    const createSourceDocument = new CreateSourceDocument(validDoc);
    expect(createSourceDocument.status).equals('uploaded');
    expect(createSourceDocument.linkedSections).to.deep.equal([]);
  });

  it('throws when storageRef is missing', () => {
    const { storageRef, ...rest } = validDoc;
    expect(() => new CreateSourceDocument(rest)).to.throw('storageRef missing!');
  });

  it('throws when uploadedByUserId is missing', () => {
    const { uploadedByUserId, ...rest } = validDoc;
    expect(() => new CreateSourceDocument(rest)).to.throw('uploadedByUserId missing!');
  });

});
