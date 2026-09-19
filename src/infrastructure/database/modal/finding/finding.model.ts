import { model } from "mongoose";
import { IFindingDocument, IFindingModel } from "./finding.types";
import FindingSchema from "./finding.schema";
export const FindingModel = model<IFindingDocument>("finding", FindingSchema) as IFindingModel;
