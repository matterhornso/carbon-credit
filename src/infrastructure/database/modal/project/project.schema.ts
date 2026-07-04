import { Schema } from "mongoose";
import { createProject, getAllProjects, getProjectById, updateProject } from "./project.statics";

const ProjectSchema = new Schema({
  uuid: String,
  company_name: {
    type: String,
    required: true
  },
  type: [{
    type: String,
    required: true
  }],
  start_date:{
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  section_a: {
    type: Schema.Types.ObjectId,
    ref: 'projectSectionA'
  },
  section_b: {
    type: Schema.Types.ObjectId,
    ref: 'projectSectionB'
  },
  section_c: {
    type: Schema.Types.ObjectId,
    ref: 'projectSectionC'
  },
  section_d: {
    type: Schema.Types.ObjectId,
    ref: 'projectSectionD'
  },
  section_e: {
    type: Schema.Types.ObjectId,
    ref: 'projectSectionE'
  },
  user_details: {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false
    },
    uuid: {
      type: String,
      required: false
    },
    user_id: {
      type: String,
      required: false,
    }
  }
}, { timestamps: true });

ProjectSchema.statics.createProject = createProject;
ProjectSchema.statics.updateProject = updateProject;
ProjectSchema.statics.getAllProjects = getAllProjects;
ProjectSchema.statics.getProjectById = getProjectById;

export default ProjectSchema;