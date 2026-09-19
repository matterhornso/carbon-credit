import { CreateFinding } from "../../../../domain/finding/CreateFinding";
import { IFindingInterface } from "../../../../domain/finding/findingInterface";
import { FindingConnection } from "../../../../interfaces/database/IDBConnection"
import { FindingModel } from "../../modal/finding/finding.model";

export class FindingMongoConnection extends FindingConnection {

  constructor() {
    super();
  }

  async createFinding(tenantId: string, finding: CreateFinding): Promise<IFindingInterface> {
    return await FindingModel.createFinding(tenantId, finding);
  }

  async replaceOpenSelfReviewFindings(tenantId: string, projectId: string, sectionKey: string, findings: CreateFinding[]): Promise<IFindingInterface[]> {
    return await FindingModel.replaceOpenSelfReviewFindings(tenantId, projectId, sectionKey, findings);
  }

  async getFindingsByProjectId(tenantId: string, projectId: string): Promise<IFindingInterface[]> {
    return await FindingModel.getFindingsByProjectId(tenantId, projectId);
  }

  async getFindingStatsByMethodology(tenantId: string, methodologyCode?: string): Promise<any[]> {
    return await FindingModel.getFindingStatsByMethodology(tenantId, methodologyCode);
  }

  async updateFindingStatus(tenantId: string, id: string, status: string, resolutionNote?: string): Promise<IFindingInterface | null> {
    return await FindingModel.updateFindingStatus(tenantId, id, status, resolutionNote);
  }
}
