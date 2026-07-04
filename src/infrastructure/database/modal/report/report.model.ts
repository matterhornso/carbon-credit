import { model } from "mongoose";
import { IReportDocument, IReportModel } from "./report.types";
import ReportSchema from "./report.schema";
export const ReportModel = model<IReportDocument>("report", ReportSchema) as IReportModel;