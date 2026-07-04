import { IProjectSectionB, ISectionBStep1, ISectionBStep2 } from "./projectSectionBInterface"
import { v4 as generateUUID } from 'uuid';
export class CreateProjectSectionB implements IProjectSectionB {
  uuid!: string | undefined;
  project_id!: string;
  step1!: ISectionBStep1;
  step2!: ISectionBStep2;
  constructor() {
  }
  createSectionB(sectionB: IProjectSectionB) {
    if (!sectionB.project_id) throw new Error('project id  missing!');
    this.uuid = generateUUID()
    this.project_id = sectionB.project_id
    return this
  }
  createStep1(sectionB: IProjectSectionB) {
    if (!sectionB.step1) throw new Error('section_B step1 ->  missing!');
    if (!sectionB.step1.general_description) throw new Error('section_B step1 -> general_description missing!');
    if (!sectionB.step1.technical_description) throw new Error('section_B step1 -> technical_description missing!');
    if (!sectionB.step1.data_tables_technical_description_attach) throw new Error('section_B step1 -> data_tables_technical_description_attach missing!');
    if (!sectionB.step1.operational_description) throw new Error('section_B step1 -> operational_description missing!');
    if (!sectionB.step1.shut_down_details) throw new Error('section_B step1 -> shut_down_details missing!');
    for (let index = 0; index < sectionB.step1.shut_down_details.length; index++) {
      const element = sectionB.step1.shut_down_details[index];
      if (element.sl_no == undefined && element.sl_no == "") throw new Error('section_B step3 -> shut_down_details -> sl_no  missing!');
      if (element.stopping_date == undefined && element.stopping_date == "") throw new Error('section_B step3 -> shut_down_details -> stopping_date  missing!');
      if (element.start_date == undefined && element.start_date == "") throw new Error('section_B step3 -> shut_down_details -> start_date  missing!');
      if (element.duration == undefined && element.duration == "") throw new Error('section_B step3 -> shut_down_details -> start_date  missing!');
      if (element.reason == undefined && element.reason == "") throw new Error('section_B step3 -> shut_down_details -> reason  missing!');
    }
    this.uuid = sectionB.uuid
    this.step1 = sectionB.step1
    return this
  }
  createStep2(sectionB: IProjectSectionB) {
    if (!sectionB.step2) throw new Error('section_B step1 ->  missing!');
    if (!sectionB.step2.temporary_deviation) throw new Error('section_B step2 -> temporary_deviation missing!');
    if (!sectionB.step2.corrections) throw new Error('section_B step2 -> corrections missing!');
    if (!sectionB.step2.permanent_changes_from_registered_monitoring_plan) throw new Error('section_B step2 -> permanent_changes_from_registered_monitoring_plan missing!');
    if (!sectionB.step2.change_project_design) throw new Error('section_B step2 -> change_project_design missing!');
    if (!sectionB.step2.change_startDate_creditPeriod) throw new Error('section_B step2 -> change_startDate_creditPeriod missing!');
    if (!sectionB.step2.typeOf_changes_specific) throw new Error('section_B step2 -> typeOf_changes_specific missing!');
    this.step2 = sectionB.step2;
    this.uuid = sectionB.uuid
    return this
  }
}