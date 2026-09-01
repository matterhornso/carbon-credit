import { model } from "mongoose";
import { IMethodologyDocument, IMethodologyModel } from "./methodology.types";
import MethodologySchema from "./methodology.schema";
export const MethodologyModel = model<IMethodologyDocument>("methodology", MethodologySchema) as IMethodologyModel;
