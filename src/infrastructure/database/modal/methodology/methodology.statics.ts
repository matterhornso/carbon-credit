import { IMethodologyModel } from "./methodology.types";
import { Model } from "mongoose";
import { IMethodologyInterface } from "../../../../domain/methodology/methodologyInterface";

export async function createMethodology(
  this: Model<IMethodologyModel>,
  methodology: IMethodologyInterface
): Promise<any> {
  try {
    const record = await this.create(methodology)
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }
}

export async function getAllMethodologies(
  this: Model<IMethodologyModel>,
  filter?: any
): Promise<any> {
  let query: any = { status: 'active' };
  if (filter?.sector) {
    query.sector = { $in: Array.isArray(filter.sector) ? filter.sector : [filter.sector] };
  }
  if (filter?.status) {
    query.status = filter.status;
  }
  const records = await this.find(query).sort({ code: 1 });
  return records || [];
}

export async function getMethodologyById(
  this: Model<IMethodologyModel>,
  id: string
): Promise<any> {
  const record = await this.findOne({ _id: id });
  return record || null;
}

export async function getMethodologyByCode(
  this: Model<IMethodologyModel>,
  code: string
): Promise<any> {
  const record = await this.findOne({ code, status: 'active' }).sort({ version: -1 });
  return record || null;
}
