import { Document, Model } from "mongoose";
import { IProjectInterface } from "../../../../domain/project/projectInterface"

export interface IProjectDocument extends IProjectInterface, Document { }

export interface IProjectModel extends Model<IProjectDocument> {
  createProject: (this: IProjectModel, project: IProjectInterface) => Promise<IProjectInterface>;
  updateProject: (this: IProjectModel, project: IProjectInterface) => Promise<IProjectInterface>;
  getProjectById: (this: IProjectModel, id: string) => Promise<IProjectInterface>;
  getAllProjects: (this: IProjectModel,filter?:any) => Promise<IProjectInterface>;
}