import { Schema } from "mongoose";
import { createSectionC, createStep1 } from "./project_section_c.statics";

const ProjectSectionCSchema = new Schema({
  uuid: String,
  project_id: {
    type: String,
    required: false
  },
  step1: {
    name: {
      type: String,
      required: false,
      default: 'Description of Monitoring Activity'
    },
    description: {
      type: String,
      required: false
    },
    monitoring_plan: {
      type: String,
      required: false
    },
    attach_org_structure_and_responsibilities_chart: [{
      type: String,
      required: false
    }],
    specific_data_monitored: {
      type: String,
      required: false
    }
  }
}, { timestamps: true });
ProjectSectionCSchema.statics.createSectionC = createSectionC;
ProjectSectionCSchema.statics.createStep1 = createStep1;

export default ProjectSectionCSchema;