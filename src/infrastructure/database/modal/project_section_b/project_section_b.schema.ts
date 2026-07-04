import { Schema } from "mongoose";
import { createSectionB, createStep1, createStep2 } from "./project_section_b.statics";

const ProjectSectionBSchema = new Schema({
  uuid: String,
  project_id: {
    type: String,
    required: false
  },
  step1: {
    name: {
      type: String,
      required: false,
      default: 'Description of implementation registered project activity'
    },
    general_description: {
      type: String,
      required: false
    },
    technical_description: {
      type: String,
      required: false
    },
    data_tables_technical_description_attach: [{
      type: String,
      required: false
    }],
    operational_description: {
      type: String,
      required: false
    },
    shut_down_details: [{
      sl_no: {
        type: String,
        required: false
      },
      stopping_date: {
        type: Date,
        required: false
      },
      start_date: {
        type: Date,
        required: false
      },
      duration: {
        type: String,
        required: false
      },
      reason: {
        type: String,
        required: false
      }
    }],
    summary_of_implementation_milestones: [{
      event: {
        type: String,
        required: false
      },
      date: {
        type: Date,
        required: false
      }
    }],
  },
  step2: {
    name: {
      type: String,
      required: false,
      default: 'Post registration changes'
    },
    temporary_deviation: {
      type: String,
      required: false
    },
    corrections: {
      type: String,
      required: false
    },
    permanent_changes_from_registered_monitoring_plan: [{
      type: String,
      required: false
    }],
    change_project_design: {
      type: String,
      required: false
    },
    change_startDate_creditPeriod: {
      type: Date,
      required: false
    },
    typeOf_changes_specific: {
      type: String,
      required: false
    }
  }
}, { timestamps: true });
ProjectSectionBSchema.statics.createSectionB = createSectionB;
ProjectSectionBSchema.statics.createStep1 = createStep1;
ProjectSectionBSchema.statics.createStep2 = createStep2;
export default ProjectSectionBSchema;