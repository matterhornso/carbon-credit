import { model } from "mongoose";
import { IProjectSectionEDocument, IProjectSectionEModel } from "./project_section_e.types";
import ProjectSectionESchema from "./project_section_e.schema";
export const ProjectSectionEModel = model<IProjectSectionEDocument>("projectSectionE", ProjectSectionESchema) as IProjectSectionEModel;