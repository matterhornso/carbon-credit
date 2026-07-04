
import { IProjectRepository } from '../../application/repositories/IProjectRepository'
import { CreateProject, UpdateProject } from '../../domain'
import { ProjectConnection } from './IDBConnection'
import { IProjectInterface } from "../../domain/project/projectInterface";
export class ProjectRepository extends IProjectRepository {
  private connection: ProjectConnection

  constructor(connection: ProjectConnection) {
    super()
    this.connection = connection
  }

  async createProject(project: CreateProject): Promise<IProjectInterface> {
    let queryResults = await this.connection.createProject(project);
    return queryResults;
  }

  async updateProject(project: UpdateProject): Promise<IProjectInterface> {
    let queryResults = await this.connection.updateProject(project);
    return queryResults;
  }

  async getAllProjects(filter?: any): Promise<IProjectInterface> {
    let queryResults = await this.connection.getAllProjects(filter);
    return queryResults;
  }

  async getProjectById(id: string): Promise<IProjectInterface> {
    let queryResults = await this.connection.getProjectById(id);
    return queryResults;
  }
}