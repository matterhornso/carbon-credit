import { CreateFinding } from "../../domain/finding/CreateFinding";
import { IFindingInterface } from "../../domain/finding/findingInterface";

// Tenancy is absent from this signature by design: the scope is bound when the
// repository is constructed, so a usecase cannot forget it and cannot widen it.
export abstract class IFindingRepository {
  abstract createFinding(finding: CreateFinding): Promise<IFindingInterface>
  abstract replaceOpenSelfReviewFindings(projectId: string, sectionKey: string, findings: CreateFinding[]): Promise<IFindingInterface[]>
  abstract getFindingsByProjectId(projectId: string): Promise<IFindingInterface[]>
  abstract getFindingStatsByMethodology(methodologyCode?: string): Promise<any[]>
  abstract updateFindingStatus(id: string, status: string, resolutionNote?: string): Promise<IFindingInterface | null>
}
