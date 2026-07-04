import { IProjectModel } from "./project.types";
import { Model } from "mongoose";
import { IProjectInterface } from "../../../../domain/project/projectInterface";
import { database } from "faker";

export async function createProject(
  this: Model<IProjectModel>,
  project: IProjectInterface
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

export async function updateProject(
  this: Model<IProjectModel>,
  data: IProjectInterface
): Promise<any> {
  try {
    console.log(data)
    const record = await this.updateOne({ uuid: data.uuid },
      {
        $set: {
          section_a: data.section_a, section_b: data.section_b, section_c: data.section_c,
          section_d: data.section_d, section_e: data.section_e
        }
      })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}

export async function getProjectById(
  this: Model<IProjectModel>,
  id: string
): Promise<any> {
  const record = await this.findOne({ _id: id }).populate("section_a").populate("section_b").populate("section_c").populate("section_d").populate("section_e").sort({ "createdAt": -1 })

  if (record) {
    return record
  } else {
    return []
  }
}
export async function getAllProjects(
  this: Model<IProjectModel>,
  filter?: any
): Promise<any> {
  let query:any={}
  console.log(filter)
  if(filter.user_id){
    query["user.user_id"]=filter.user_id
  }

  // if(filter.theme){
  //   query["theme"]={$in:filter.theme}
  // }

  // if(filter.category){
  //   query["category"]={$in:filter.category}
  // }
  // if(filter.sub_category){
  //   query["category"]={$in:filter.category}
  // }
  // if(filter.sector){
  //   query["sector"]={$in:filter.sector}
  // }
  const record = await this.find(query)
  .populate("section_a").populate("section_b").populate("section_c").populate("section_d").populate("section_e").sort({ "createdAt": -1 })

  if (record) {
    return record
  } else {
    return []
  }
}
