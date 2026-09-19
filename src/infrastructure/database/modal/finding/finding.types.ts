import { Document, Model } from "mongoose";
import { IFindingInterface } from "../../../../domain/finding/findingInterface"

export interface IFindingDocument extends IFindingInterface, Document { }

export interface IFindingModel extends Model<IFindingDocument> {
  createFinding: (this: IFindingModel, tenantId: string, finding: IFindingInterface) => Promise<IFindingInterface>;
  replaceOpenSelfReviewFindings: (this: IFindingModel, tenantId: string, projectId: string, sectionKey: string, findings: IFindingInterface[]) => Promise<IFindingInterface[]>;
  getFindingsByProjectId: (this: IFindingModel, tenantId: string, projectId: string) => Promise<IFindingInterface[]>;
  getFindingStatsByMethodology: (this: IFindingModel, tenantId: string, methodologyCode?: string) => Promise<any[]>;
  updateFindingStatus: (this: IFindingModel, tenantId: string, id: string, status: string, resolutionNote?: string) => Promise<IFindingInterface | null>;
}
