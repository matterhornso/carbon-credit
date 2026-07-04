import { Schema } from "mongoose";
import { createSectionA, createStep1, createStep2, createStep3, createStep4, createStep5 } from "./project_section_a.statics";

const ProjectSectionASchema = new Schema({
  uuid: String,
  project_id: {
    type: String,
    required: false
  },
  step1: {
    name: {
      type: String,
      default: 'Purpose and General description of project activity'
    },
    purpose_and_description: {
      type: String,
      required: true
    },
    measure_taken_for_gas_emissions: {
      type: String,
      required: true
    },
    brief_description_installed_tech: {
      type: String,
      required: true
    },
    project_comissioning_date: {
      type: Date,
      required: true
    },
    construction_date: {
      type: String,
      required: true
    },
    operation_period: {
      type: String,
      required: true
    },
    total_GHG_emission: {
      type: String,
      required: true
    },
  },
  step2: {
    name: {
      type: String,
      default: 'Location'
    },
    country: {
      type: String,
      required: false
    },
    state: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: false
    },
    village: {
      type: String,
      required: false
    },
    pincode: [{
      type: String,
      required: false
    }],
    landmark: {
      type: String,
      required: false
    },
    file_attach: [{
      type: String,
      required: false
    }]
  },
  step3: {
    name: {
      type: String,
      required: false,
      default: 'Parties & Project Participants'
    },
    party_and_project_participants: [{
      party_involved: {
        type: String,
        required: false
      },
      private_or_public_project_participant: {
        type: String,
        required: false
      },
      indicate_party_involved: {
        type: String,
        required: false,
        enum: ['Yes', 'No', 'Not Sure']
      }
    }]
  },
  step4: {
    name: {
      type: String,
      required: false,
      default: 'Reference & Applied Methodology'
    },
    methodologies: [{
      methodology: {
        type: String,
        required: false
      },
      project_type: {
        type: String,
        required: false
      },
      category: {
        type: String,
        required: false
      },
      version: {
        type: String,
        required: false
      },
      tools: {
        type: String,
        required: false
      }
    }]
  },
  step5: {
    name: {
      type: String,
      required: false,
      default: 'Credit Period'
    },
    credit_start_period: {
      type: Date,
      required: false
    },
    credit_period: {
      start_date: {
        type: Date,
        required: false
      },
      end_date: {
        type: Date,
        required: false
      }
    },
    credit_period_description: {
      type: String,
      required: false
    },
    category: {
      type: String,
      required: false
    },
    version: {
      type: String,
      required: false
    },
    tools: {
      type: String,
      required: false
    }
  }
}, { timestamps: true });

ProjectSectionASchema.statics.createSectionA = createSectionA;
ProjectSectionASchema.statics.createStep1 = createStep1;
ProjectSectionASchema.statics.createStep2 = createStep2;
ProjectSectionASchema.statics.createStep3 = createStep3;
ProjectSectionASchema.statics.createStep4 = createStep4;
ProjectSectionASchema.statics.createStep5 = createStep5;

export default ProjectSectionASchema;