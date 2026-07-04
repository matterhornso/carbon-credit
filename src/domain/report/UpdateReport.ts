
import { IReportInterface } from './reportInterface';
import { v4 as generateUUID } from 'uuid';
import { Types } from 'mongoose';

export class UpdateReport implements IReportInterface {
  project_id?: string;
  current_month?: string;
  next_date?: Date;
  quantity?: string;
  ghg_reduction_explanation?: string;
  constructor(report: IReportInterface) {

    this.current_month = report.current_month;
    this.project_id = report.project_id;
    this.next_date = report.next_date;
    this.quantity = report.quantity;
    this.ghg_reduction_explanation = report.ghg_reduction_explanation;
  }
}