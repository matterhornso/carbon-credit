import { Types } from 'mongoose';
export interface IProjectSectionB {
  _id?: Types.ObjectId;
  uuid?: string;
  project_id: string;
  step1?: ISectionBStep1,
  step2?: ISectionBStep2
}
export interface ISectionBStep1 {
  general_description: string;
  technical_description: string;
  data_tables_technical_description_attach: string[];
  operational_description: string;
  shut_down_details: IShut_down_details[];
  summary_of_implementation_milestones: ISummary_of_implementation_milestones[]
}
export interface ISectionBStep2 {
  temporary_deviation: string;
  corrections: string;
  permanent_changes_from_registered_monitoring_plan: string[];
  change_project_design: string;
  change_startDate_creditPeriod: Date;
  typeOf_changes_specific: string;
}
export interface IShut_down_details {
  sl_no: string;
  stopping_date: Date;
  start_date: Date;
  duration: string;
  reason: string;
}
export interface ISummary_of_implementation_milestones {
  event: string;
  date: Date;
}