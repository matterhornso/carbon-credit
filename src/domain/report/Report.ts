import { IReportInterface } from './reportInterface';
import { CreateReport, UpdateReport } from "../index"
import { ReportUseCase } from '../../application//usecases/index';
export class Report {
  create(report: IReportInterface, useCase: ReportUseCase) {
    let createReport = new CreateReport(report);
    return useCase.createReport(createReport)
  }

  update(report: IReportInterface, useCase: ReportUseCase) {
    let updateReport = new UpdateReport(report);
    return useCase.updateReport(updateReport)
  }
}