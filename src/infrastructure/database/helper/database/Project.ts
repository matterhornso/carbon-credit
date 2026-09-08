import { CreateProject, UpdateProject } from "../../../../domain";
import { IProjectInterface } from "../../../../domain/project/projectInterface";
import { ProjectConnection } from "../../../../interfaces/database/IDBConnection"
import { ProjectModel } from "../../modal/project/project.model";

export class ProjectMongoConnection extends ProjectConnection {

  constructor() {
    super();
  }
  async createProject(tenantId: string, project: CreateProject): Promise<IProjectInterface> {
    let project_res = await ProjectModel.createProject(tenantId, project);
    return project_res;
  }

  async updateProject(tenantId: string, project: UpdateProject): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.updateProject(tenantId, project);
    return project_res;
  }

  async transitionStatus(tenantId: string, id: string, status: string): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.transitionStatus(tenantId, id, status);
    return project_res;
  }

  async setCaseDocumentId(tenantId: string, id: string, caseDocumentId: string): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.setCaseDocumentId(tenantId, id, caseDocumentId);
    return project_res;
  }

  async addAttachment(tenantId: string, id: string, sourceDocumentId: string): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.addAttachment(tenantId, id, sourceDocumentId);
    return project_res;
  }

  async getAllProjects(tenantId: string, filter?: any): Promise<IProjectInterface[]> {
    let project_res = await ProjectModel.getAllProjects(tenantId, filter);
    return project_res;
  }

  async getProjectById(tenantId: string, id: string): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.getProjectById(tenantId, id);
    return project_res;
  }

}
