
import { IReportInterface } from './reportInterface';
import { v4 as generateUUID } from 'uuid';
export class CreateReport implements IReportInterface {
  project_id?: string;
  current_month?: string;
  next_date?: Date;
  quantity?: string;
  ghg_reduction_explanation?: string;

  constructor(report: IReportInterface) {
    if (!report.project_id) throw new Error('project id missing!');
    if (!report.current_month) throw new Error('current_month missing!');
    if (!report.next_date) throw new Error('next_date missing!');
    if (!report.quantity) throw new Error('report quantity missing!');
    if (!report.ghg_reduction_explanation) throw new Error('report ghg_reduction_explanation missing!');
    this.current_month = report.current_month;
    this.project_id = report.project_id;
    this.next_date = report.next_date;
    this.quantity = report.quantity;
    this.ghg_reduction_explanation = report.ghg_reduction_explanation;
  }
}