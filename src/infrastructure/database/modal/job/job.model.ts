import { model, Document, Model } from "mongoose";
import { IJobInterface } from "../../../../domain/job/jobInterface";
import JobSchema from "./job.schema";

export interface IJobDocument extends IJobInterface, Document { }
export const JobModel = model<IJobDocument>("job", JobSchema) as Model<IJobDocument>;
