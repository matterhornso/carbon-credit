import { Schema } from "mongoose";
import { createProject, updateProject, transitionStatus, setCaseDocumentId, addAttachment, getAllProjects, getProjectById } from "./project.statics";

const ProjectLocationSchema = new Schema({
  country: String,
  state: String,
  city: String,
  description: String,
}, { _id: false });

const ProjectCreditingPeriodSchema = new Schema({
  start: Date,
  end: Date,
}, { _id: false });

const ProjectSchema = new Schema({
  // Isolation boundary. Indexed because every query filters on it.
  tenantId: { type: String, required: true, index: true },
  name: {
    type: String,
    required: true
  },
  proponentOrgId: {
    type: String,
    required: true
  },
  createdByUserId: {
    type: String,
    required: true
  },
  methodologyId: {
    type: Schema.Types.ObjectId,
    ref: 'methodology',
  },
  sector: {
    type: String,
    required: true
  },
  location: ProjectLocationSchema,
  scale: {
    type: String
  },
  startDate: {
    type: Date
  },
  creditingPeriod: ProjectCreditingPeriodSchema,
  status: {
    type: String,
    required: true,
    default: 'DRAFT_INTAKE'
  },
  intake: {
    type: Schema.Types.Mixed,
    default: {}
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'source_document',
  }],
  caseDocumentId: {
    type: Schema.Types.ObjectId,
    ref: 'case_document',
  },
}, { timestamps: true });

ProjectSchema.index({ proponentOrgId: 1 });
ProjectSchema.index({ createdByUserId: 1 });

ProjectSchema.statics.createProject = createProject;
ProjectSchema.statics.updateProject = updateProject;
ProjectSchema.statics.transitionStatus = transitionStatus;
ProjectSchema.statics.setCaseDocumentId = setCaseDocumentId;
ProjectSchema.statics.addAttachment = addAttachment;
ProjectSchema.statics.getAllProjects = getAllProjects;
ProjectSchema.statics.getProjectById = getProjectById;

export default ProjectSchema;
