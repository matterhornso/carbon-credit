
import { IReportRepository } from '../../application/repositories/IReportRepository'
import { CreateReport, UpdateReport } from '../../domain'
import { ReportConnection } from './IDBConnection'
import { IReportInterface } from "../../domain/report/reportInterface";
export class ReportRepository extends IReportRepository {
  private connection: ReportConnection

  constructor(connection: ReportConnection) {
    super()
    this.connection = connection
  }

  async createReport(report: CreateReport): Promise<IReportInterface> {
    let queryResults = await this.connection.createReport(report);
    return queryResults;
  }

  async updateReport(report: UpdateReport): Promise<IReportInterface> {
    let queryResults = await this.connection.updateReport(report);
    return queryResults;
  }

  async getAllReports(filter?: any): Promise<IReportInterface> {
    let queryResults = await this.connection.getAllReports(filter);
    return queryResults;
  }

  async getReportById(id: string): Promise<IReportInterface> {
    let queryResults = await this.connection.getReportById(id);
    return queryResults;
  }
}