import { ICaseDocumentInterface, ICaseSection } from './caseDocumentInterface';

export class CreateCaseDocument implements ICaseDocumentInterface {
  projectId!: string;
  sections!: ICaseSection[];

  // sectionKeys comes from the project's selected Methodology.sectionGuidance
  // — this is what makes CaseDocument creation methodology-agnostic.
  constructor(data: { projectId: string; sectionKeys: string[] }) {
    if (!data.projectId) throw new Error('projectId missing!');
    if (!data.sectionKeys || !data.sectionKeys.length) throw new Error('sectionKeys missing!');
    this.projectId = data.projectId;
    this.sections = data.sectionKeys.map((key) => ({
      key,
      status: 'not_started',
      sourceCitations: [],
      generationHistory: [],
    }));
  }
}
