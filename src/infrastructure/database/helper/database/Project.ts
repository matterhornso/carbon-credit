import { CreateProject, UpdateProject } from "../../../../domain";
import { IProjectInterface } from "../../../../domain/project/projectInterface";
import { ProjectConnection } from "../../../../interfaces/database/IDBConnection"
import { ProjectModel } from "../../modal/project/project.model";

export class ProjectMongoConnection extends ProjectConnection {

  constructor() {
    super();
  }
  async createProject(project: CreateProject): Promise<IProjectInterface> {
    let project_res = await ProjectModel.createProject(project);
    return project_res;
  }

  async updateProject(project: UpdateProject): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.updateProject(project);
    return project_res;
  }

  async transitionStatus(id: string, status: string): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.transitionStatus(id, status);
    return project_res;
  }

  async setCaseDocumentId(id: string, caseDocumentId: string): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.setCaseDocumentId(id, caseDocumentId);
    return project_res;
  }

  async addAttachment(id: string, sourceDocumentId: string): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.addAttachment(id, sourceDocumentId);
    return project_res;
  }

  async getAllProjects(filter?: any): Promise<IProjectInterface[]> {
    let project_res = await ProjectModel.getAllProjects(filter);
    return project_res;
  }

  async getProjectById(id: string): Promise<IProjectInterface | null> {
    let project_res = await ProjectModel.getProjectById(id);
    return project_res;
  }

}
