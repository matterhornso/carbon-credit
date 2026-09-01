import { expect } from 'chai';
import { CreateProject } from '../project/CreateProject';
import { PROJECT_STATUSES } from '../project/projectStatus';

describe('Test class CreateProject', () => {

  const validProject: any = {
    name: 'Test Reforestation Project',
    sector: 'AFOLU',
    proponentOrgId: 'org-1',
    createdByUserId: 'user-1',
  };

  it('sets the supplied fields', () => {
    const createProject = new CreateProject(validProject);
    expect(createProject.name).equals(validProject.name);
    expect(createProject.sector).equals(validProject.sector);
    expect(createProject.proponentOrgId).equals(validProject.proponentOrgId);
    expect(createProject.createdByUserId).equals(validProject.createdByUserId);
  });

  it('defaults status to DRAFT_INTAKE', () => {
    const createProject = new CreateProject(validProject);
    expect(createProject.status).equals(PROJECT_STATUSES.DRAFT_INTAKE);
  });

  it('defaults attachments to an empty array', () => {
    const createProject = new CreateProject(validProject);
    expect(createProject.attachments).to.deep.equal([]);
  });

  it('defaults intake to an empty object', () => {
    const createProject = new CreateProject(validProject);
    expect(createProject.intake).to.deep.equal({});
  });

  it('throws when name is missing', () => {
    const { name, ...rest } = validProject;
    expect(() => new CreateProject(rest)).to.throw('project name missing!');
  });

  it('throws when sector is missing', () => {
    const { sector, ...rest } = validProject;
    expect(() => new CreateProject(rest)).to.throw('project sector missing!');
  });

  it('throws when proponentOrgId is missing', () => {
    const { proponentOrgId, ...rest } = validProject;
    expect(() => new CreateProject(rest)).to.throw('proponentOrgId missing!');
  });

  it('throws when createdByUserId is missing', () => {
    const { createdByUserId, ...rest } = validProject;
    expect(() => new CreateProject(rest)).to.throw('createdByUserId missing!');
  });

});
