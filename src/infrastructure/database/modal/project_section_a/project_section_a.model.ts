import { model } from "mongoose";
import { IProjectSectionADocument, IProjectSectionAModel } from "./project_section_a.types";
import ProjectSectionASchema from "./project_section_a.schema";
export const ProjectSectionAModel = model<IProjectSectionADocument>("projectSectionA", ProjectSectionASchema) as IProjectSectionAModel;