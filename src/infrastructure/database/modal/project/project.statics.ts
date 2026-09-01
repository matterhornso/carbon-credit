import { IProjectModel } from "./project.types";
import { Model } from "mongoose";
import { IProjectInterface } from "../../../../domain/project/projectInterface";

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
  data: any
): Promise<any> {
  const setFields: any = {};
  if (data.methodologyId !== undefined) setFields.methodologyId = data.methodologyId;
  if (data.location !== undefined) setFields.location = data.location;
  if (data.scale !== undefined) setFields.scale = data.scale;
  if (data.startDate !== undefined) setFields.startDate = data.startDate;
  if (data.creditingPeriod !== undefined) setFields.creditingPeriod = data.creditingPeriod;
  if (data.intake !== undefined) setFields.intake = data.intake;

  const record = await this.findOneAndUpdate(
    { _id: data.id },
    { $set: setFields },
    { new: true }
  );
  return record || null;
}

export async function transitionStatus(
  this: Model<IProjectModel>,
  id: string,
  status: string
): Promise<any> {
  const record = await this.findOneAndUpdate(
    { _id: id },
    { $set: { status } },
    { new: true }
  );
  return record || null;
}

export async function setCaseDocumentId(
  this: Model<IProjectModel>,
  id: string,
  caseDocumentId: string
): Promise<any> {
  const record = await this.findOneAndUpdate(
    { _id: id },
    { $set: { caseDocumentId } },
    { new: true }
  );
  return record || null;
}

export async function addAttachment(
  this: Model<IProjectModel>,
  id: string,
  sourceDocumentId: string
): Promise<any> {
  const record = await this.findOneAndUpdate(
    { _id: id },
    { $push: { attachments: sourceDocumentId } },
    { new: true }
  );
  return record || null;
}

export async function getProjectById(
  this: Model<IProjectModel>,
  id: string
): Promise<any> {
  const record = await this.findOne({ _id: id }).populate("methodologyId").populate("caseDocumentId");
  return record || null;
}

export async function getAllProjects(
  this: Model<IProjectModel>,
  filter?: any
): Promise<any> {
  let query: any = {};
  if (filter?.proponentOrgId) query.proponentOrgId = filter.proponentOrgId;
  if (filter?.createdByUserId) query.createdByUserId = filter.createdByUserId;
  if (filter?.status) query.status = filter.status;
  const records = await this.find(query).sort({ createdAt: -1 });
  return records || [];
}
