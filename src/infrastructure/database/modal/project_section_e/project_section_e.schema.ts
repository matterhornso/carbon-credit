import { Schema } from "mongoose";
import { createSectionE, createStep1, createStep2, createStep3, createStep4, createStep5, createStep6, createStep7 } from "./project_section_e.statics";

const ProjectSectionESchema = new Schema({
  uuid: String,
  project_id: {
    type: String,
    required: false
  },
  step1: {
    name: {
      type: String,
      required: false,
      default: 'Calculation of baseline emissions or net GHG removals'
    },
    calculation_of_baselineEmissions_or_net_GHG: {
      type: String,
      required: false
    },
    attach_relevant_docs: [{
      type: String,
      required: false
    }]
  },
  step2: {
    name: {
      type: String,
      required: false,
      default: 'Calculation of project emissions or actual net GHG removals'
    },
    calculation_of_projectEmissions_or_net_GHG: {
      type: String,
      required: false
    },
    attach_relevant_docs: [{
      type: String,
      required: false
    }]
  },
  step3: {
    name: {
      type: String,
      required: false,
      default: 'Calculation of leakage'
    },
    calculation_of_leakage: {
      type: String,
      required: false
    },
    attach_relevant_docs: [{
      type: String,
      required: false
    }]
  },
  step4: {
    name: {
      type: String,
      required: false,
      default: 'Calculation summary of emission reductions or net anthropogenic GHG removals'
    },
    calculation_of_emissions_reduction: {
      type: String,
      required: false
    },
    attach_relevant_docs: [{
      type: String,
      required: false
    }]
  },
  step5: {
    name: {
      type: String,
      required: false,
      default: 'Comparison of actual emission reductions or net anthropogenic GHG removals'
    },
    comparison_of_actual_emission_reduction: {
      type: String,
      required: false
    },
    attach_relevant_docs: [{
      type: String,
      required: false
    }]
  },
  step6: {
    name: {
      type: String,
      required: false,
      default: "Remarks on difference from estimated value"
    },
    remark_on_difference_from_estimate_value: {
      type: String,
      required: false
    },
    attach_relevant_docs: [{
      type: String,
      required: false
    }]
  },
  step7: {
    name: {
      type: String,
      required: false,
      default: "Actual emission reductions or net anthropogenic GHG removals during 1st commitment period"
    },
    actual_emission_reductions: {
      type: String,
      required: false
    },
    attach_relevant_docs: [{
      type: String,
      required: false
    }]
  }
}, { timestamps: true });

ProjectSectionESchema.statics.createSectionE = createSectionE;
ProjectSectionESchema.statics.createStep1 = createStep1;
ProjectSectionESchema.statics.createStep2 = createStep2;
ProjectSectionESchema.statics.createStep3 = createStep3;
ProjectSectionESchema.statics.createStep4 = createStep4;
ProjectSectionESchema.statics.createStep5 = createStep5;
ProjectSectionESchema.statics.createStep6 = createStep6;
ProjectSectionESchema.statics.createStep7 = createStep7;
export default ProjectSectionESchema;