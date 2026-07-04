import { Document, Model, Types } from "mongoose";
import { IProjectSectionD } from "../../../../domain/project_section_d/projectSectionDInterface"

export interface IProjectSectionDDocument extends IProjectSectionD, Document {_id?: Types.ObjectId; }

export interface IProjectSectionDModel extends Model<IProjectSectionDDocument> {
  createSectionD: (this: IProjectSectionDModel, project: IProjectSectionD) => Promise<IProjectSectionD>;
  createStep1: (this: IProjectSectionDModel, project: IProjectSectionD) => Promise<IProjectSectionD>;
  createStep2: (this: IProjectSectionDModel, project: IProjectSectionD) => Promise<IProjectSectionD>;
  createStep3: (this: IProjectSectionDModel, project: IProjectSectionD) => Promise<IProjectSectionD>;
}