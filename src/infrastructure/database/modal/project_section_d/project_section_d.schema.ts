import { Schema } from "mongoose";
import { createSectionD, createStep1, createStep2, createStep3 } from "./project_section_d.statics";

const ProjectSectionDSchema = new Schema({
  uuid: String,
  project_id: {
    type: String,
    required: false
  },
  step1: {
    name: {
      type: String,
      required: false,
      default: 'Data and parameters fixed ex ante or at renewal of crediting period'
    },
    data_and_parameter_fixed_ExAnte: {
      type: String,
      required: false
    },
    attach_ex_ante_table: [{
      type: String,
      required: false
    }]
  },
  step2: {
    name: {
      type: String,
      required: false,
      default: 'Data & parameters monitored'
    },
    data_and_parameter_monitored_ExPost: {
      type: String,
      required: false
    },
    attach_ex_ante_table: [{
      type: String,
      required: false
    }]
  },
  step3: {
    name: {
      type: String,
      required: false,
      default: 'Implementation of Sampling Plan'
    },
    implementation_of_sampling_plan: {
      type: String,
      required: false
    }
  }
}, { timestamps: true });
ProjectSectionDSchema.statics.createSectionD = createSectionD;
ProjectSectionDSchema.statics.createStep1 = createStep1;
ProjectSectionDSchema.statics.createStep2 = createStep2;
ProjectSectionDSchema.statics.createStep3 = createStep3;

export default ProjectSectionDSchema;