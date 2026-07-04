import { Types } from 'mongoose';

export interface IReportInterface {
  project_id?: string;
  current_month?: string;
  next_date?: Date;
  quantity?: string;
  ghg_reduction_explanation?: string;
}