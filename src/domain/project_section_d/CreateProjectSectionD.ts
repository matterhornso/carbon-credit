import { IProjectSectionD, ISectionDStep1, ISectionDStep2, ISectionDStep3 } from "./projectSectionDInterface"
import { v4 as generateUUID } from 'uuid';
export class CreateProjectSectionD implements IProjectSectionD {
  uuid!: string | undefined;
  project_id!: string;
  step1!: ISectionDStep1;
  step2!: ISectionDStep2;
  step3!: ISectionDStep3;

  constructor() {
  }

  createSectionD(sectionD: IProjectSectionD) {
    if (!sectionD.project_id) throw new Error('project id  missing!');
    this.uuid = generateUUID()
    this.project_id = sectionD.project_id
    return this
  }
  createStep1(sectionD: IProjectSectionD) {
    if (!sectionD.step1) throw new Error('section_D step1 ->  missing!');
    if (!sectionD.step1.data_and_parameter_fixed_ExAnte) throw new Error('section_D step1 -> description missing!');
    if (!sectionD.step1.attach_ex_ante_table) throw new Error('section_D step1 -> attach_ex_ante_table missing!');
    if (sectionD.step1.attach_ex_ante_table.length == 0) throw new Error('section_D step1 -> attach_ex_ante_table missing!');
    this.step1 = sectionD.step1
    this.uuid = sectionD.uuid
    return this
  }
  createStep2(sectionD: IProjectSectionD) {
    if (!sectionD.step2) throw new Error('section_D step2 ->  missing!');
    if (!sectionD.step2.data_and_parameter_monitored_ExPost) throw new Error('section_D step2 -> description missing!');
    if (!sectionD.step2.attach_ex_ante_table) throw new Error('section_D step2 -> monitoring_plan missing!');
    if (sectionD.step2.attach_ex_ante_table.length == 0) throw new Error('section_D step2 -> monitoring_plan missing!');
    this.step2 = sectionD.step2
    this.uuid = sectionD.uuid
    return this
  }
  createStep3(sectionD: IProjectSectionD) {
    if (!sectionD.step3) throw new Error('section_D step3 ->  missing!');
    if (!sectionD.step3.implementation_of_sampling_plan) throw new Error('section_D step3 -> implementation_of_sampling_plan missing!');
    this.step3 = sectionD.step3
    this.uuid = sectionD.uuid
    return this
  }
}