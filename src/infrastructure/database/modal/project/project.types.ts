import { Document, Model } from "mongoose";
import { IProjectInterface } from "../../../../domain/project/projectInterface"

export interface IProjectDocument extends IProjectInterface, Document { }

export interface IProjectModel extends Model<IProjectDocument> {
  createProject: (this: IProjectModel, tenantId: string, project: IProjectInterface) => Promise<IProjectInterface>;
  updateProject: (this: IProjectModel, tenantId: string, data: any) => Promise<IProjectInterface | null>;
  transitionStatus: (this: IProjectModel, tenantId: string, id: string, status: string) => Promise<IProjectInterface | null>;
  setCaseDocumentId: (this: IProjectModel, tenantId: string, id: string, caseDocumentId: string) => Promise<IProjectInterface | null>;
  addAttachment: (this: IProjectModel, tenantId: string, id: string, sourceDocumentId: string) => Promise<IProjectInterface | null>;
  getProjectById: (this: IProjectModel, tenantId: string, id: string) => Promise<IProjectInterface | null>;
  getAllProjects: (this: IProjectModel, tenantId: string, filter?: any) => Promise<IProjectInterface[]>;
}
