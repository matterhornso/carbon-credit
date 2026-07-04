import { CreateReport, UpdateReport } from "../../domain";
import { IReportInterface } from "../../domain/report/reportInterface";

export abstract class IReportRepository {
  abstract createReport(report: CreateReport): Promise<IReportInterface>
  abstract updateReport(report: UpdateReport): Promise<IReportInterface>
  abstract getAllReports(filter?:any): Promise<any>
  abstract getReportById(id: string): Promise<any>
}