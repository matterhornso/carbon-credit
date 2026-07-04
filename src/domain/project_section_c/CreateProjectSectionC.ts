import { IProjectSectionC, ISectionCStep1 } from "./projectSectionCInterface"
import { v4 as generateUUID } from 'uuid';
export class CreateProjectSectionC implements IProjectSectionC {
  uuid!: string | undefined;
  project_id!: string;
  step1!: ISectionCStep1;
  constructor() {
  }
  createSectionC(SectionC: IProjectSectionC) {
    if (!SectionC.project_id) throw new Error('project id  missing!');
    this.uuid = generateUUID()
    this.project_id = SectionC.project_id
    return this
  }
  createStep1(SectionC: IProjectSectionC) {
    if (!SectionC.step1) throw new Error('section_C step1 ->  missing!');
    if (!SectionC.step1.description) throw new Error('section_C step1 -> description missing!');
    if (!SectionC.step1.monitoring_plan) throw new Error('section_C step1 -> monitoring_plan missing!');
    if (!SectionC.step1.attach_org_structure_and_responsibilities_chart) throw new Error('section_C step1 -> attach_org_structure_and_responsibilities_chart missing!');
    if (SectionC.step1.attach_org_structure_and_responsibilities_chart.length == 0) throw new Error('section_C step1 -> attach_org_structure_and_responsibilities_chart missing!');
    if (!SectionC.step1.specific_data_monitored) throw new Error('section_C step1 -> specific_data_monitored missing!');
    this.step1 = SectionC.step1
    this.uuid = SectionC.uuid
    return this
  }
}