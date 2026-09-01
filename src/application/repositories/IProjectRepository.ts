import { CreateProject, UpdateProject } from "../../domain";
import { IProjectInterface } from "../../domain/project/projectInterface";

export abstract class IProjectRepository {
  abstract createProject(project: CreateProject): Promise<IProjectInterface>
  abstract updateProject(project: UpdateProject): Promise<IProjectInterface | null>
  abstract transitionStatus(id: string, status: string): Promise<IProjectInterface | null>
  abstract setCaseDocumentId(id: string, caseDocumentId: string): Promise<IProjectInterface | null>
  abstract addAttachment(id: string, sourceDocumentId: string): Promise<IProjectInterface | null>
  abstract getAllProjects(filter?: any): Promise<IProjectInterface[]>
  abstract getProjectById(id: string): Promise<IProjectInterface | null>
}
