import { IProjectModel } from "./project.types";
import { Model } from "mongoose";
import { IProjectInterface } from "../../../../domain/project/projectInterface";

export async function createProject(
  this: Model<IProjectModel>,
  tenantId: string,
  project: IProjectInterface
): Promise<any> {
  try {
    const record = await this.create({ ...project, tenantId })
    return record;
  }
  catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db")
  }
}

export async function updateProject(
  this: Model<IProjectModel>,
  tenantId: string,
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
    { _id: data.id, tenantId },
    { $set: setFields },
    { new: true }
  );
  return record || null;
}

export async function transitionStatus(
  this: Model<IProjectModel>,
  tenantId: string,
  id: string,
  status: string
): Promise<any> {
  const record = await this.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: { status } },
    { new: true }
  );
  return record || null;
}

export async function setCaseDocumentId(
  this: Model<IProjectModel>,
  tenantId: string,
  id: string,
  caseDocumentId: string
): Promise<any> {
  const record = await this.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: { caseDocumentId } },
    { new: true }
  );
  return record || null;
}

export async function addAttachment(
  this: Model<IProjectModel>,
  tenantId: string,
  id: string,
  sourceDocumentId: string
): Promise<any> {
  const record = await this.findOneAndUpdate(
    { _id: id, tenantId },
    { $push: { attachments: sourceDocumentId } },
    { new: true }
  );
  return record || null;
}

export async function getProjectById(
  this: Model<IProjectModel>,
  tenantId: string,
  id: string
): Promise<any> {
  const record = await this.findOne({ _id: id, tenantId }).populate("methodologyId").populate("caseDocumentId");
  return record || null;
}

// A page size nobody asked for is still a page size: without one this returned
// every project in the tenant, which is fine at a dozen and a problem at the
// portfolio sizes this platform exists to support. DEFAULT applies when the
// caller says nothing; MAX is the ceiling a caller cannot argue past.
export const PROJECT_PAGE_SIZE_DEFAULT = 50;
export const PROJECT_PAGE_SIZE_MAX = 200;

export async function getAllProjects(
  this: Model<IProjectModel>,
  tenantId: string,
  filter?: any
): Promise<any> {
  // tenantId is applied last so a caller-supplied filter cannot widen it.
  let query: any = {};
  if (filter?.proponentOrgId) query.proponentOrgId = filter.proponentOrgId;
  if (filter?.createdByUserId) query.createdByUserId = filter.createdByUserId;
  if (filter?.status) query.status = filter.status;
  query.tenantId = tenantId;

  // Clamp rather than reject. A caller asking for 10,000 wants "as many as I
  // can have", and failing the request teaches them nothing; capping gives them
  // the answer plus a `total` that says what they did not get.
  const requestedLimit = Number(filter?.limit);
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? Math.min(Math.floor(requestedLimit), PROJECT_PAGE_SIZE_MAX)
    : PROJECT_PAGE_SIZE_DEFAULT;

  const requestedSkip = Number(filter?.skip);
  const skip = Number.isFinite(requestedSkip) && requestedSkip > 0 ? Math.floor(requestedSkip) : 0;

  // countDocuments runs the same query, so `total` reflects the tenant filter
  // too - it can never report rows the caller is not allowed to see.
  const [items, total] = await Promise.all([
    this.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    this.countDocuments(query),
  ]);

  return { items: items || [], total, limit, skip };
}
