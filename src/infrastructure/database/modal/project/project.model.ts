import { model } from "mongoose";
import { IProjectDocument, IProjectModel } from "./project.types";
import ProjectSchema from "./project.schema";
export const ProjectModel = model<IProjectDocument>("project", ProjectSchema) as IProjectModel;