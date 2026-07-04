import { IProjectSectionE, ISectionEStep1, ISectionEStep2, ISectionEStep3, ISectionEStep4, ISectionEStep5, ISectionEStep6, ISectionEStep7 } from "./projectSectionEInterface"
import { v4 as generateUUID } from 'uuid';
export class CreateProjectSectionE implements IProjectSectionE {
  uuid!: string | undefined;
  project_id!: string;
  step1!: ISectionEStep1;
  step2!: ISectionEStep2;
  step3!: ISectionEStep3;
  step4!: ISectionEStep4;
  step5!: ISectionEStep5;
  step6!: ISectionEStep6;
  step7!: ISectionEStep7;
  constructor() {
  }


  createSectionE(sectionE: IProjectSectionE) {
    if (!sectionE.project_id) throw new Error('project id  missing!');
    this.uuid = generateUUID()
    this.project_id = sectionE.project_id
    return this
  }
  createStep1(sectionE: IProjectSectionE) {
    if (!sectionE.step1) throw new Error('section_E step1 ->  missing!');
    if (!sectionE.step1.calculation_of_baselineEmissions_or_net_GHG) throw new Error('section_E step1 -> calculation_of_baselineEmissions_or_net_GHG missing!');
    if (!sectionE.step1.attach_relevant_docs) throw new Error('section_E step1 -> attach_relevant_docs missing!');
    if (sectionE.step1.attach_relevant_docs.length == 0) throw new Error('section_E step1 -> attach_relevant_docs missing!');
    this.step1 = sectionE.step1
    this.uuid = sectionE.uuid
    return this
  }
  createStep2(sectionE: IProjectSectionE) {
    if (!sectionE.step2) throw new Error('section_E step2 ->  missing!');
    if (!sectionE.step2.calculation_of_projectEmissions_or_net_GHG) throw new Error('section_E step2 -> calculation_of_projectEmissions_or_net_GHG missing!');
    if (!sectionE.step2.attach_relevant_docs) throw new Error('section_E step2 -> attach_relevant_docs missing!');
    if (sectionE.step2.attach_relevant_docs.length == 0) throw new Error('section_E step2 -> attach_relevant_docs missing!');
    this.step2 = sectionE.step2
    this.uuid = sectionE.uuid
    return this
  }
  createStep3(sectionE: IProjectSectionE) {
    if (!sectionE.step3) throw new Error('section_E step3 ->  missing!');
    if (!sectionE.step3.calculation_of_leakage) throw new Error('section_E step3 -> calculation_of_leakage missing!');
    if (!sectionE.step3.attach_relevant_docs) throw new Error('section_E step3 -> attach_relevant_docs missing!');
    if (sectionE.step3.attach_relevant_docs.length == 0) throw new Error('section_E step3 -> attach_relevant_docs missing!');
    this.step3 = sectionE.step3
    this.uuid = sectionE.uuid
    return this
  }
  createStep4(sectionE: IProjectSectionE) {
    if (!sectionE.step4) throw new Error('section_E step4 ->  missing!');
    if (!sectionE.step4.calculation_of_emissions_reduction) throw new Error('section_E step4 -> calculation_of_emissions_reduction missing!');
    if (!sectionE.step4.attach_relevant_docs) throw new Error('section_E step4 -> attach_relevant_docs missing!');
    if (sectionE.step4.attach_relevant_docs.length == 0) throw new Error('section_E step4 -> attach_relevant_docs missing!');
    this.step4 = sectionE.step4
    this.uuid = sectionE.uuid
    return this
  }
  createStep5(sectionE: IProjectSectionE) {
    if (!sectionE.step5) throw new Error('section_E step5 ->  missing!');
    if (!sectionE.step5.comparison_of_actual_emission_reduction) throw new Error('section_E step5 -> comparison_of_actual_emission_reduction missing!');
    if (!sectionE.step5.attach_relevant_docs) throw new Error('section_E step5 -> attach_relevant_docs missing!');
    if (sectionE.step5.attach_relevant_docs.length == 0) throw new Error('section_E step5 -> attach_relevant_docs missing!');
    this.step5 = sectionE.step5
    this.uuid = sectionE.uuid
    return this
  }
  createStep6(sectionE: IProjectSectionE) {
    if (!sectionE.step6) throw new Error('section_E step6 ->  missing!');
    if (!sectionE.step6.remark_on_difference_from_estimate_value) throw new Error('section_E step6 -> remark_on_difference_from_estimate_value missing!');
    if (!sectionE.step6.attach_relevant_docs) throw new Error('section_E step6 -> attach_relevant_docs missing!');
    if (sectionE.step6.attach_relevant_docs.length == 0) throw new Error('section_E step6 -> attach_relevant_docs missing!');
    this.step6 = sectionE.step6
    this.uuid = sectionE.uuid
    return this
  }
  createStep7(sectionE: IProjectSectionE) {
    if (!sectionE.step7) throw new Error('section_E step7 ->  missing!');
    if (!sectionE.step7.actual_emission_reductions) throw new Error('section_E step7 -> actual_emission_reductions missing!');
    if (!sectionE.step7.attach_relevant_docs) throw new Error('section_E step7 -> attach_relevant_docs missing!');
    if (sectionE.step7.attach_relevant_docs.length == 0) throw new Error('section_E step7 -> attach_relevant_docs missing!');
    this.step7 = sectionE.step7
    this.uuid = sectionE.uuid
    return this
  }
}