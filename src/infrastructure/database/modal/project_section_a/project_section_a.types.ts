import { Document, Model, Types } from "mongoose";
import { IProjectSectionA } from "../../../../domain/project_section_a/projectSectionAInterface"

export interface IProjectSectionADocument extends IProjectSectionA, Document {  _id?: Types.ObjectId;}

export interface IProjectSectionAModel extends Model<IProjectSectionADocument> {
  createSectionA: (this: IProjectSectionAModel, project: IProjectSectionA) => Promise<IProjectSectionA>;
  createStep1: (this: IProjectSectionAModel, project: IProjectSectionA) => Promise<IProjectSectionA>;
  createStep2: (this: IProjectSectionAModel, project: IProjectSectionA) => Promise<IProjectSectionA>;
  createStep3: (this: IProjectSectionAModel, project: IProjectSectionA) => Promise<IProjectSectionA>;
  createStep4: (this: IProjectSectionAModel, project: IProjectSectionA) => Promise<IProjectSectionA>;
  createStep5: (this: IProjectSectionAModel, project: IProjectSectionA) => Promise<IProjectSectionA>;
}