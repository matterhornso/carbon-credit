import { IProjectSectionBModel } from "./project_section_b.types";
import { Model } from "mongoose";
import { IProjectSectionB } from "../../../../domain/project_section_b/projectSectionBInterface";

export async function createSectionB(
  this: Model<IProjectSectionBModel>,
  project: IProjectSectionB
): Promise<any> {
  try {
    const record = await this.create(project)
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}

export async function createStep1(
  this: Model<IProjectSectionBModel>,
  project: IProjectSectionB
): Promise<any> {
  try {
    console.log(project)
    let step1 = project.step1;
    const record = await this.updateOne({ uuid: project.uuid }, { $set: { step1: step1 } })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}


export async function createStep2(
  this: Model<IProjectSectionBModel>,
  project: IProjectSectionB
): Promise<any> {
  try {
    let step2 = project.step2;
    const record = await this.updateOne({ uuid: project.uuid }, { $set: { step2: step2 } })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}


