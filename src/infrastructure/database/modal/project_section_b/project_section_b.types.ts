import { Document, Model } from "mongoose";
import { Types } from 'mongoose';
import { IProjectSectionB } from "../../../../domain/project_section_b/projectSectionBInterface"

export interface IProjectSectionBDocument extends IProjectSectionB, Document {_id?: Types.ObjectId; }

export interface IProjectSectionBModel extends Model<IProjectSectionBDocument> {
  createSectionB: (this: IProjectSectionBModel, project: IProjectSectionB) => Promise<IProjectSectionB>;
  createStep1: (this: IProjectSectionBModel, project: IProjectSectionB) => Promise<IProjectSectionB>;
  createStep2: (this: IProjectSectionBModel, project: IProjectSectionB) => Promise<IProjectSectionB>;
}