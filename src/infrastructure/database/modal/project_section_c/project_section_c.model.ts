import { model } from "mongoose";
import { IProjectSectionCDocument, IProjectSectionCModel } from "./project_section_c.types";
import ProjectSectionCSchema from "./project_section_c.schema";
export const ProjectSectionCModel = model<IProjectSectionCDocument>("projectSectionC", ProjectSectionCSchema) as IProjectSectionCModel;