import { IFindingModel } from "./finding.types";
import { Model } from "mongoose";
import { IFindingInterface } from "../../../../domain/finding/findingInterface";

export async function createFinding(
  this: Model<IFindingModel>,
  tenantId: string,
  finding: IFindingInterface
): Promise<any> {
  try {
    const record = await this.create({ ...finding, tenantId });
    return record;
  } catch (error: any) {
    console.trace(error);
    throw new Error("somethings went wrong -> db");
  }
}

// Replaces the open self-review findings for one section before writing the new
// ones. A re-review of a regenerated section must not leave the previous pass's
// findings behind, or the count grows every time someone clicks the button and
// the series measures clicks rather than cases.
//
// Deliberately narrow: only self_review, only open. A finding a VVB raised is
// evidence about the outside world and is never ours to discard, and one a
// human has accepted or resolved is a decision that outlives a regenerate.
export async function replaceOpenSelfReviewFindings(
  this: Model<IFindingModel>,
  tenantId: string,
  projectId: string,
  sectionKey: string,
  findings: IFindingInterface[]
): Promise<any> {
  await this.deleteMany({ tenantId, projectId, sectionKey, origin: 'self_review', status: 'open' });
  if (!findings.length) return [];
  return await this.insertMany(findings.map((f) => ({ ...f, tenantId })));
}

export async function getFindingsByProjectId(
  this: Model<IFindingModel>,
  tenantId: string,
  projectId: string
): Promise<any> {
  const records = await this.find({ projectId, tenantId }).sort({ createdAt: -1 });
  return records || [];
}

// The query the whole aggregate exists for: findings grouped across projects,
// which is where the pattern lives. Scoped by tenant like everything else, so
// one operator's series can never include another's.
export async function getFindingStatsByMethodology(
  this: Model<IFindingModel>,
  tenantId: string,
  methodologyCode?: string
): Promise<any> {
  const match: any = { tenantId };
  if (methodologyCode) match.methodologyCode = methodologyCode;

  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: { methodologyCode: '$methodologyCode', sectionKey: '$sectionKey', category: '$category' },
        total: { $sum: 1 },
        blocking: { $sum: { $cond: [{ $eq: ['$severity', 'blocking'] }, 1, 0] } },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
  ]);
}

export async function updateFindingStatus(
  this: Model<IFindingModel>,
  tenantId: string,
  id: string,
  status: string,
  resolutionNote?: string
): Promise<any> {
  const resolved = status === 'resolved' || status === 'rejected';
  return await this.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: { status, resolutionNote, ...(resolved ? { resolvedAt: new Date() } : {}) } },
    { new: true }
  );
}
