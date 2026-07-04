import { IProjectSectionEModel } from "./project_section_e.types";
import { Model } from "mongoose";
import { IProjectSectionE } from "../../../../domain/project_section_e/projectSectionEInterface";

export async function createSectionE(
  this: Model<IProjectSectionEModel>,
  project: IProjectSectionE
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
  this: Model<IProjectSectionEModel>,
  project: IProjectSectionE
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
  this: Model<IProjectSectionEModel>,
  project: IProjectSectionE
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
  this: Model<IProjectSectionEModel>,
  project: IProjectSectionE
): Promise<any> {
  try {
    console.log(project)
    let step3 = project.step3;
    const record = await this.updateOne({ uuid: project.uuid }, { $set: { step3: step3 } })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }
}

export async function createStep4(
  this: Model<IProjectSectionEModel>,
  project: IProjectSectionE
): Promise<any> {
  try {
    let step4 = project.step4;
    const record = await this.updateOne({ uuid: project.uuid }, { $set: { step4: step4 } })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }
}

export async function createStep5(
  this: Model<IProjectSectionEModel>,
  project: IProjectSectionE
): Promise<any> {
  try {
    let step5 = project.step5;
    const record = await this.updateOne({ uuid: project.uuid }, { $set: { step5: step5 } })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }
}

export async function createStep6(
  this: Model<IProjectSectionEModel>,
  project: IProjectSectionE
): Promise<any> {
  try {
    let step6 = project.step6;
    const record = await this.updateOne({ uuid: project.uuid }, { $set: { step6: step6 } })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }
}

export async function createStep7(
  this: Model<IProjectSectionEModel>,
  project: IProjectSectionE
): Promise<any> {
  try {
    let step7 = project.step7;
    const record = await this.updateOne({ uuid: project.uuid }, { $set: { step7: step7 } })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}


