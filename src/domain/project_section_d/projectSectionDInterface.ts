import { Types } from 'mongoose';
export interface IProjectSectionD {
  _id?: Types.ObjectId;
  uuid?: string;
  project_id: string;
  step1?: ISectionDStep1,
  step2?: ISectionDStep2,
  step3?: ISectionDStep3,
}
export interface ISectionDStep1 {
  data_and_parameter_fixed_ExAnte: string;
  attach_ex_ante_table: string[]
}
export interface ISectionDStep2 {
  data_and_parameter_monitored_ExPost: string;
  attach_ex_ante_table: string[]
}
export interface ISectionDStep3 {
  implementation_of_sampling_plan: string;
}
