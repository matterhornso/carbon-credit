import { expect } from 'chai';
import { CreateCaseDocument } from '../case_document/CreateCaseDocument';

describe('Test class CreateCaseDocument', () => {

  it('seeds one not_started section per section key', () => {
    const createCaseDocument = new CreateCaseDocument({ projectId: 'project-1', sectionKeys: ['project_description', 'additionality'] });
    expect(createCaseDocument.sections).to.have.lengthOf(2);
    expect(createCaseDocument.sections[0]).to.deep.include({ key: 'project_description', status: 'not_started' });
    expect(createCaseDocument.sections[1]).to.deep.include({ key: 'additionality', status: 'not_started' });
  });

  it('throws when projectId is missing', () => {
    expect(() => new CreateCaseDocument({ projectId: '', sectionKeys: ['project_description'] })).to.throw('projectId missing!');
  });

  it('throws when sectionKeys is empty', () => {
    expect(() => new CreateCaseDocument({ projectId: 'project-1', sectionKeys: [] })).to.throw('sectionKeys missing!');
  });

});
