
import { IProjectSectionBRepository } from '../../application/repositories/IProjectSectionBRepository'
import { CreateProjectSectionB } from '../../domain'
import { ProjectSectionBConnection } from './IDBConnection'
import { IProjectSectionB } from "../../domain/project_section_b/projectSectionBInterface";
export class ProjectSectionBRepository extends IProjectSectionBRepository {
  private connection: ProjectSectionBConnection

  constructor(connection: ProjectSectionBConnection) {
    super()
    this.connection = connection
  }

  async createSectionB(project: CreateProjectSectionB): Promise<IProjectSectionB> {
    let queryResults = await this.connection.createSectionB(project);
    return queryResults;
  }

  async createStep1(project: CreateProjectSectionB): Promise<IProjectSectionB> {
    let queryResults = await this.connection.createStep1(project);
    return queryResults;
  }

  async createStep2(project: CreateProjectSectionB): Promise<IProjectSectionB> {
    let queryResults = await this.connection.createStep2(project);
    return queryResults;
  }

}