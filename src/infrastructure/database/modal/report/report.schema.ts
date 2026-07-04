import { Schema } from "mongoose";
import { createReport, getAllReports, getReportById, updateReport } from "./report.statics";

const ReportSchema = new Schema({
  project_id: {
    type: String,
    required: true
  },
  current_month: [{
    type: String,
    required: true
  }],
  next_date:{
    type: Date,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  ghg_reduction_explanation: {
    type: String,
    required: true
  },
}, { timestamps: true });

ReportSchema.statics.createReport = createReport;
ReportSchema.statics.updateReport = updateReport;
ReportSchema.statics.getAllReports = getAllReports;
ReportSchema.statics.getReportById = getReportById;

export default ReportSchema;