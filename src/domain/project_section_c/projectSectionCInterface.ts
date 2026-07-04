import { Types } from 'mongoose';
export interface IProjectSectionC {
  _id?: Types.ObjectId;
  uuid?: string;
  project_id: string;
  step1?: ISectionCStep1,
}
export interface ISectionCStep1 {
  description: string;
  monitoring_plan: string;
  attach_org_structure_and_responsibilities_chart: string[];
  specific_data_monitored: string;
}