import { IProjectSectionCModel } from "./project_section_c.types";
import { Model } from "mongoose";
import { IProjectSectionC } from "../../../../domain/project_section_c/projectSectionCInterface";

export async function createSectionC(
  this: Model<IProjectSectionCModel>,
  project: IProjectSectionC
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
  this: Model<IProjectSectionCModel>,
  project: IProjectSectionC
): Promise<any> {
  try {
    let step1 = project.step1;
    const record = await this.updateOne({ uuid: project.uuid }, { $set: { step1: step1 } })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}


