import { IProjectInterface } from './projectInterface';
import { PROJECT_STATUSES } from './projectStatus';

// Deliberately narrow: a project starts as just a name + sector, in
// DRAFT_INTAKE. Methodology selection and intake are separate actions
// (ProjectController.selectMethodology / submitIntake) — see the project
// lifecycle state machine.
export class CreateProject implements IProjectInterface {
  name!: string;
  sector!: string;
  proponentOrgId!: string;
  createdByUserId!: string;
  status!: string;
  attachments!: string[];
  intake!: Record<string, any>;

  constructor(project: IProjectInterface) {
    if (!project.name) throw new Error('project name missing!');
    if (!project.sector) throw new Error('project sector missing!');
    if (!project.proponentOrgId) throw new Error('proponentOrgId missing!');
    if (!project.createdByUserId) throw new Error('createdByUserId missing!');
    this.name = project.name;
    this.sector = project.sector;
    this.proponentOrgId = project.proponentOrgId;
    this.createdByUserId = project.createdByUserId;
    this.status = PROJECT_STATUSES.DRAFT_INTAKE;
    this.attachments = [];
    this.intake = {};
  }
}
