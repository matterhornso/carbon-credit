import { IReportModel } from "./report.types";
import { Model } from "mongoose";
import { IReportInterface } from "../../../../domain/report/reportInterface";
import { database } from "faker";

export async function createReport(
  this: Model<IReportModel>,
  report: IReportInterface
): Promise<any> {
  try {
    const record = await this.create(report)
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}

export async function updateReport(
  this: Model<IReportModel>,
  data: any
): Promise<any> {
  try {
    console.log(data)
    const record = await this.updateOne({ _id: data.id },
      {
        $set: {
          data
        }
      })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }

}

export async function getReportById(
  this: Model<IReportModel>,
  id: string
): Promise<any> {
  const record = await this.findOne({ _id: id }).sort({ "createdAt": -1 })

  console.log(record, "record")
  if (record) {
    return record
  } else {
    return []
  }
}
export async function getAllReports(
  this: Model<IReportModel>,
  filter?: any
): Promise<any> {
  let query:any={}
  console.log(filter)
  if(filter.project_id){
    query["project_id"]=filter.project_id
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
    .sort({ "createdAt": -1 })

    console.log(record, "record")

  if (record) {
    return record
  } else {
    return []
  }
}
