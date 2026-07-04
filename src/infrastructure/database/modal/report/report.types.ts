import { Document, Model } from "mongoose";
import { IReportInterface } from "../../../../domain/report/reportInterface"

export interface IReportDocument extends IReportInterface, Document { }

export interface IReportModel extends Model<IReportDocument> {
  createReport: (this: IReportModel, report: IReportInterface) => Promise<IReportInterface>;
  updateReport: (this: IReportModel, report: IReportInterface) => Promise<IReportInterface>;
  getReportById: (this: IReportModel, id: string) => Promise<IReportInterface>;
  getAllReports: (this: IReportModel,filter?:any) => Promise<IReportInterface>;
}