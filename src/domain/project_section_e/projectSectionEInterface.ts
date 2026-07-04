import { Types } from 'mongoose';
export interface IProjectSectionE {
  _id?: Types.ObjectId;
  uuid?: string;
  project_id: string;
  step1?: ISectionEStep1,
  step2?: ISectionEStep2,
  step3?: ISectionEStep3,
  step4?: ISectionEStep4,
  step5?: ISectionEStep5,
  step6?: ISectionEStep6,
  step7?: ISectionEStep7,
}
export interface ISectionEStep1 {
  calculation_of_baselineEmissions_or_net_GHG: string;
  attach_relevant_docs: string[]
}
export interface ISectionEStep2 {
  calculation_of_projectEmissions_or_net_GHG: string;
  attach_relevant_docs: string[]
}
export interface ISectionEStep3 {
  calculation_of_leakage: string;
  attach_relevant_docs: string[]
}
export interface ISectionEStep4 {
  calculation_of_emissions_reduction: string;
  attach_relevant_docs: string[]
}
export interface ISectionEStep5 {
  comparison_of_actual_emission_reduction: string;
  attach_relevant_docs: string[]
}
export interface ISectionEStep6 {
  remark_on_difference_from_estimate_value: string;
  attach_relevant_docs: string[]
}
export interface ISectionEStep7 {
  actual_emission_reductions: string;
  attach_relevant_docs: string[]
}