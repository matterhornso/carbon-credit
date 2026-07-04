import { Document, Model, Types } from "mongoose";
import { IProjectSectionE } from "../../../../domain/project_section_e/projectSectionEInterface"

export interface IProjectSectionEDocument extends IProjectSectionE, Document { _id?: Types.ObjectId;}

export interface IProjectSectionEModel extends Model<IProjectSectionEDocument> {
  createSectionE: (this: IProjectSectionEModel, project: IProjectSectionE) => Promise<IProjectSectionE>;
  createStep1: (this: IProjectSectionEModel, project: IProjectSectionE) => Promise<IProjectSectionE>;
  createStep2: (this: IProjectSectionEModel, project: IProjectSectionE) => Promise<IProjectSectionE>;
  createStep3: (this: IProjectSectionEModel, project: IProjectSectionE) => Promise<IProjectSectionE>;
  createStep4: (this: IProjectSectionEModel, project: IProjectSectionE) => Promise<IProjectSectionE>;
  createStep5: (this: IProjectSectionEModel, project: IProjectSectionE) => Promise<IProjectSectionE>;
  createStep6: (this: IProjectSectionEModel, project: IProjectSectionE) => Promise<IProjectSectionE>;
  createStep7: (this: IProjectSectionEModel, project: IProjectSectionE) => Promise<IProjectSectionE>;
}