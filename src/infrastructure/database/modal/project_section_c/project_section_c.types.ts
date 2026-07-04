import { Document, Model, Types } from "mongoose";
import { IProjectSectionC } from "../../../../domain/project_section_c/projectSectionCInterface"

export interface IProjectSectionCDocument extends IProjectSectionC, Document { _id?: Types.ObjectId;}

export interface IProjectSectionCModel extends Model<IProjectSectionCDocument> {
  createSectionC: (this: IProjectSectionCModel, project: IProjectSectionC) => Promise<IProjectSectionC>;
  createStep1: (this: IProjectSectionCModel, project: IProjectSectionC) => Promise<IProjectSectionC>;
}