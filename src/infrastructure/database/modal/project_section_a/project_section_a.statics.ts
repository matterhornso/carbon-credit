import { IProjectSectionAModel } from "./project_section_a.types";
import { Model } from "mongoose";
import { IProjectSectionA } from "../../../../domain/project_section_a/projectSectionAInterface";

export async function createSectionA(
  this: Model<IProjectSectionAModel>,
  project: IProjectSectionA
): Promise<any> {
  try {
    console.log("projectseca", project)
    const record = await this.create(project)
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}

export async function createStep1(
  this: Model<IProjectSectionAModel>,
  project: IProjectSectionA
): Promise<any> {
  try {
    console.log(project, "static")
    let step1 = project.step1;
    const record = await this.updateOne({uuid:project.uuid},{$set:{step1:step1}})
    console.log(record)
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}


export async function createStep2(
  this: Model<IProjectSectionAModel>,
  project: IProjectSectionA
): Promise<any> {
  try {
    let step2 = project.step2;
    const record = await this.updateOne({uuid:project.uuid},{$set:{step2:step2}})
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}


export async function createStep3(
  this: Model<IProjectSectionAModel>,
  project: IProjectSectionA
): Promise<any> {
  try {
    let step3 = project.step3;
    const record = await this.updateOne({uuid:project.uuid},{$set:{step3:step3}})
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}


export async function createStep4(
  this: Model<IProjectSectionAModel>,
  project: IProjectSectionA
): Promise<any> {
  try {
    let step4 = project.step4;
    const record = await this.updateOne({uuid:project.uuid},{$set:{step4:step4}})
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}


export async function createStep5(
  this: Model<IProjectSectionAModel>,
  project: IProjectSectionA
): Promise<any> {
  try {
    let step5 = project.step5;
    const record = await this.updateOne({uuid:project.uuid},{$set:{step5:step5}})
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}

