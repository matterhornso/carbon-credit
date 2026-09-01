import { Document, Model } from "mongoose";
import { IMethodologyInterface } from "../../../../domain/methodology/methodologyInterface"

export interface IMethodologyDocument extends IMethodologyInterface, Document { }

export interface IMethodologyModel extends Model<IMethodologyDocument> {
  createMethodology: (this: IMethodologyModel, methodology: IMethodologyInterface) => Promise<IMethodologyInterface>;
  getAllMethodologies: (this: IMethodologyModel, filter?: any) => Promise<IMethodologyInterface[]>;
  getMethodologyById: (this: IMethodologyModel, id: string) => Promise<IMethodologyInterface>;
  getMethodologyByCode: (this: IMethodologyModel, code: string) => Promise<IMethodologyInterface>;
}
