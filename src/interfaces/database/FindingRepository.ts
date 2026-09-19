import { IFindingRepository } from '../../application/repositories/IFindingRepository'
import { CreateFinding } from '../../domain/finding/CreateFinding'
import { TenantScope } from '../../domain/tenant/TenantScope'
import { FindingConnection } from './IDBConnection'
import { IFindingInterface } from "../../domain/finding/findingInterface";

export class FindingRepository extends IFindingRepository {
  private connection: FindingConnection
  private scope: TenantScope

  constructor(connection: FindingConnection, scope: TenantScope) {
    super()
    this.connection = connection
    this.scope = scope
  }

  async createFinding(finding: CreateFinding): Promise<IFindingInterface> {
    return await this.connection.createFinding(this.scope.tenantId, finding);
  }

  async replaceOpenSelfReviewFindings(projectId: string, sectionKey: string, findings: CreateFinding[]): Promise<IFindingInterface[]> {
    return await this.connection.replaceOpenSelfReviewFindings(this.scope.tenantId, projectId, sectionKey, findings);
  }

  async getFindingsByProjectId(projectId: string): Promise<IFindingInterface[]> {
    return await this.connection.getFindingsByProjectId(this.scope.tenantId, projectId);
  }

  async getFindingStatsByMethodology(methodologyCode?: string): Promise<any[]> {
    return await this.connection.getFindingStatsByMethodology(this.scope.tenantId, methodologyCode);
  }

  async updateFindingStatus(id: string, status: string, resolutionNote?: string): Promise<IFindingInterface | null> {
    return await this.connection.updateFindingStatus(this.scope.tenantId, id, status, resolutionNote);
  }
}
