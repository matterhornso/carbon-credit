import { model } from "mongoose";
import { IProjectSectionDDocument, IProjectSectionDModel } from "./project_section_d.types";
import ProjectSectionDSchema from "./project_section_d.schema";
export const ProjectSectionDModel = model<IProjectSectionDDocument>("projectSectionD", ProjectSectionDSchema, "projectSectionD") as IProjectSectionDModel;
