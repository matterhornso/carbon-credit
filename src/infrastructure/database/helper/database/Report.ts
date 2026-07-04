import { CreateReport, UpdateReport } from "../../../../domain";
import { IReportInterface } from "../../../../domain/report/reportInterface";
import { ReportConnection } from "../../../../interfaces/database/IDBConnection"
import { ReportModel } from "../../modal/report/report.model";

export class ReportMongoConnection extends ReportConnection {

  constructor() {
    super();
  }
  async createReport(report: CreateReport): Promise<IReportInterface> {
    let report_res = await ReportModel.createReport(report);
    return report_res;
  }

  async updateReport(report: UpdateReport): Promise<IReportInterface> {
    let report_res = await ReportModel.updateReport(report);
    return report_res;
  }

  async getAllReports(filter?:any): Promise<IReportInterface> {
    let report_res = await ReportModel.getAllReports(filter);
    return report_res;
  }

  async getReportById(id: string): Promise<IReportInterface> {
    let report_res = await ReportModel.getReportById(id);
    return report_res;
  }

}