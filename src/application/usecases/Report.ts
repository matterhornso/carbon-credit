import { CreateReport, UpdateReport } from "../../domain";
import { IReportRepository } from "../repositories/IReportRepository";

export default class Report {
  private reportRepository: IReportRepository;
  constructor(reportRepository: IReportRepository) {
    this.reportRepository = reportRepository;
  }

  createReport(report: CreateReport) {
    return this.reportRepository.createReport(report);
  }

  updateReport(report: UpdateReport) {
    return this.reportRepository.updateReport(report);
  }

  getAllReports(filter?:any) {
    return this.reportRepository.getAllReports(filter);
  }
  getReportById(id: string) {
    return this.reportRepository.getReportById(id);
  }


}