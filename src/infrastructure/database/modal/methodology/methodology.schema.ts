import { Schema } from "mongoose";
import { createMethodology, getAllMethodologies, getMethodologyById, getMethodologyByCode } from "./methodology.statics";

const ApplicabilityConditionSchema = new Schema({
  key: { type: String, required: true },
  statement: { type: String, required: true },
  checksInputKey: { type: String },
  operator: { type: String },
  value: { type: String },
  guidance: { type: String },
}, { _id: false });

const RequiredInputSchema = new Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  dataType: { type: String, required: true },
  unit: { type: String },
  required: { type: Boolean, default: true },
  options: [{ type: String }],
  helpText: { type: String },
}, { _id: false });

const AdditionalityTierSchema = new Schema({
  tier: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  requiredEvidence: [{ type: String }],
}, { _id: false });

const BaselineVariableSchema = new Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  source: { type: String, required: true },
  sourceRef: { type: String },
  unit: { type: String },
}, { _id: false });

const BaselineFormulaSchema = new Schema({
  description: { type: String, required: true },
  variables: [BaselineVariableSchema],
  relationship: { type: String, required: true },
}, { _id: false });

const MonitoringParameterSchema = new Schema({
  parameter: { type: String, required: true },
  unit: { type: String },
  frequency: { type: String, required: true },
  method: { type: String, required: true },
}, { _id: false });

const SectionGuidanceSchema = new Schema({
  section: { type: String, required: true },
  contentType: { type: String, required: true },
  promptFragment: { type: String, required: true },
}, { _id: false });

const SourceReferenceSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publisher: { type: String, required: true },
}, { _id: false });

const MethodologySchema = new Schema({
  code: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  standard: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'active'
  },
  supersededBy: {
    type: String
  },
  sector: {
    type: String,
    required: true
  },
  applicabilityConditions: [ApplicabilityConditionSchema],
  requiredInputs: [RequiredInputSchema],
  additionalityTiers: [AdditionalityTierSchema],
  baselineFormula: BaselineFormulaSchema,
  monitoringParameters: [MonitoringParameterSchema],
  sectionGuidance: [SectionGuidanceSchema],
  sourceReference: SourceReferenceSchema,
}, { timestamps: true });

// A methodology is uniquely identified by code+version so a superseding
// revision (e.g. VMR0017 replacing ACM0002) is a new document, not an
// overwrite — old projects keep referencing the version they were built on.
MethodologySchema.index({ code: 1, version: 1 }, { unique: true });

MethodologySchema.statics.createMethodology = createMethodology;
MethodologySchema.statics.getAllMethodologies = getAllMethodologies;
MethodologySchema.statics.getMethodologyById = getMethodologyById;
MethodologySchema.statics.getMethodologyByCode = getMethodologyByCode;

export default MethodologySchema;
