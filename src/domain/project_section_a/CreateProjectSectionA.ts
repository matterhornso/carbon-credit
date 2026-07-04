import { IProjectSectionA, IStep1, IStep2, IStep3, IStep4, IStep5 } from "./projectSectionAInterface"
import { v4 as generateUUID } from 'uuid';
export class CreateProjectSectionA implements IProjectSectionA {
  uuid!: string | undefined;
  project_id!: string;
  step1!: IStep1;
  step2!: IStep2;
  step3!: IStep3;
  step4!: IStep4;
  step5!: IStep5;
  constructor() {
  }
  createSectionA(sectionA: IProjectSectionA) {
    if (!sectionA.project_id) throw new Error('project id  missing!');
    this.uuid = generateUUID()
    this.project_id = sectionA.project_id;
    return this
  }
  createStep1(sectionA: IProjectSectionA) {
    if (!sectionA.step1) throw new Error('section_A step1 ->  missing!');
    if (!sectionA.step1.brief_description_installed_tech) throw new Error('section_A step1 -> brief_description_installed_tech missing!');
    if(!sectionA.step1.project_comissioning_date) throw new Error('section_A step1 -> project_comissioning_date missing!')
    if (!sectionA.step1.construction_date) throw new Error('section_A step1 -> construction_date missing!');
    if (!sectionA.step1.measure_taken_for_gas_emissions) throw new Error('section_A step1 -> measure_taken_for_gas_emissions missing!');
    if (!sectionA.step1.operation_period) throw new Error('section_A step1 -> operation_period missing!');
    if (!sectionA.step1.purpose_and_description) throw new Error('section_A step1 -> purpose_and_description missing!');
    if (!sectionA.step1.total_GHG_emission) throw new Error('section_A step1 -> total_GHG_emission missing!');
    this.step1 = sectionA.step1;
    this.uuid = sectionA.uuid
    return this

  }
  createStep2(sectionA: IProjectSectionA) {
    if (!sectionA.step2) throw new Error('section_A step2 ->  missing!');
    if (!sectionA.step2.country) throw new Error('section_A step2 -> country missing!');
    if (!sectionA.step2.state) throw new Error('section_A step2 -> state missing!');
    if (!sectionA.step2.city) throw new Error('section_A step2 -> city missing!');
    if (!sectionA.step2.village) throw new Error('section_A step2 -> village missing!');
    if (!sectionA.step2.pincode) throw new Error('section_A step2 -> pincode missing!');
    if (sectionA.step2.pincode.length === 0) throw new Error('section_A step2 -> pincode missing!');
    if (!sectionA.step2.landmark) throw new Error('section_A step2 -> landmark missing!');
    if (!sectionA.step2.file_attach) throw new Error('section_A step2 -> file_attach missing!');
    if (sectionA.step2.file_attach.length === 0) throw new Error('section_A step2 -> file_attach missing!');
    this.step2 = sectionA.step2
    this.uuid = sectionA.uuid
    return this
  }
  createStep3(sectionA: IProjectSectionA) {
    if (!sectionA.step3) throw new Error('section_A step3 ->  missing!');
    if (!sectionA.step3.party_and_project_participants) throw new Error('section_A step3 -> party_and_project_participants missing!');
    if (sectionA.step3.party_and_project_participants.length === 0) throw new Error('section_A step3 -> party_and_project_participants missing!');
    for (let index = 0; index < sectionA.step3.party_and_project_participants.length; index++) {
      const element = sectionA.step3.party_and_project_participants[index];
      if (element.party_involved == undefined && element.party_involved == "") {
        throw new Error('section_A step3 -> party_and_project_participants -> party_involved  missing!');
      }
      if (element.private_or_public_project_participant == undefined && element.private_or_public_project_participant == "") {
        throw new Error('section_A step3 -> party_and_project_participants -> private_or_public_project_participant missing!');
      }
      if (element.indicate_party_involved == undefined && element.indicate_party_involved == "") {
        throw new Error('section_A step3 -> party_and_project_participants -> indicate_party_involved missing!');
      }
    }
    this.step3 = sectionA.step3
    this.uuid = sectionA.uuid
    return this
  }
  createStep4(sectionA: IProjectSectionA) {
    // step 4 to be array of objects then???
    if (!sectionA.step4) throw new Error('section_A step4 ->  missing!');
    if (!sectionA.step4.methodologies) throw new Error('section_A step4 -> methodologies missing!');
    if (sectionA.step4.methodologies.length === 0) throw new Error('section_A step4 -> methodologies missing!');
    for (let index = 0; index < sectionA.step4.methodologies.length; index++) {
      const element = sectionA.step4.methodologies[index];
      if (!element.methodology) throw new Error('section_A step4 -> methodology missing!');
      if (!element.project_type) throw new Error('section_A step4 -> project_type missing!');
      if (!element.category) throw new Error('section_A step4 -> category missing!');
      if (!element.version) throw new Error('section_A step4 -> version missing!');
      if (!element.tools) throw new Error('section_A step4 -> tools missing!');
    }
    this.step4 = sectionA.step4
    this.uuid = sectionA.uuid
    return this
  }
  createStep5(sectionA: IProjectSectionA) {
    if (!sectionA.step5) throw new Error('section_A step5 ->  missing!');
    if (!sectionA.step5.credit_start_period) throw new Error('section_A step5 -> credit_start_period missing!');
    if (!sectionA.step5.credit_period) throw new Error('section_A step5 -> credit_period missing!');
    if (!sectionA.step5.credit_period.start_date) throw new Error('section_A step5 -> credit_period -> start_date missing!');
    if (!sectionA.step5.credit_period.end_date) throw new Error('section_A step5 -> credit_period -> end_date missing!');
    if (!sectionA.step5.credit_period_description) throw new Error('section_A step5 -> credit_period_description missing!');
    this.step5 = sectionA.step5
    this.uuid = sectionA.uuid
    return this
  }
}