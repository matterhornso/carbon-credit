import { Document, Model } from "mongoose";
import { IProjectInterface } from "../../../../domain/project/projectInterface"

export interface IProjectDocument extends IProjectInterface, Document { }

export interface IProjectModel extends Model<IProjectDocument> {
  createProject: (this: IProjectModel, project: IProjectInterface) => Promise<IProjectInterface>;
  updateProject: (this: IProjectModel, data: any) => Promise<IProjectInterface | null>;
  transitionStatus: (this: IProjectModel, id: string, status: string) => Promise<IProjectInterface | null>;
  setCaseDocumentId: (this: IProjectModel, id: string, caseDocumentId: string) => Promise<IProjectInterface | null>;
  addAttachment: (this: IProjectModel, id: string, sourceDocumentId: string) => Promise<IProjectInterface | null>;
  getProjectById: (this: IProjectModel, id: string) => Promise<IProjectInterface | null>;
  getAllProjects: (this: IProjectModel, filter?: any) => Promise<IProjectInterface[]>;
}
