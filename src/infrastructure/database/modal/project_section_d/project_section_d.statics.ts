import { IProjectSectionDModel } from "./project_section_d.types";
import { Model } from "mongoose";
import { IProjectSectionD } from "../../../../domain/project_section_d/projectSectionDInterface";

export async function createSectionD(
  this: Model<IProjectSectionDModel>,
  project: IProjectSectionD
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
  this: Model<IProjectSectionDModel>,
  project: IProjectSectionD
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


export async function createStep2(
  this: Model<IProjectSectionDModel>,
  project: IProjectSectionD
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

export async function createStep3(
    this: Model<IProjectSectionDModel>,
    project: IProjectSectionD
  ): Promise<any> {
    try {
      let step3 = project.step3;
      const record = await this.updateOne({ uuid: project.uuid }, { $set: { step3: step3 } })
      return record;
    }
    catch (error: any) {
      console.trace(error);
      throw new Error("somethings went wrong -> db")
    }
  
  }
