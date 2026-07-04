import { model } from "mongoose";
import { IProjectSectionBDocument, IProjectSectionBModel } from "./project_section_b.types";
import ProjectSectionBSchema from "./project_section_b.schema";
export const ProjectSectionBModel = model<IProjectSectionBDocument>("projectSectionB", ProjectSectionBSchema) as IProjectSectionBModel;