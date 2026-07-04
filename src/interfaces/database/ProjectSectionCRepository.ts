
import { IProjectSectionCRepository } from '../../application/repositories/IProjectSectionCRepository'
import { CreateProjectSectionC } from '../../domain'
import { ProjectSectionCConnection } from './IDBConnection'
import { IProjectSectionC } from "../../domain/project_section_c/projectSectionCInterface";
export class ProjectSectionCRepository extends IProjectSectionCRepository {
  private connection: ProjectSectionCConnection

  constructor(connection: ProjectSectionCConnection) {
    super()
    this.connection = connection
  }

  async createSectionC(project: CreateProjectSectionC): Promise<IProjectSectionC> {
    let queryResults = await this.connection.createSectionC(project);
    return queryResults;
  }

  async createStep1(project: CreateProjectSectionC): Promise<IProjectSectionC> {
    let queryResults = await this.connection.createStep1(project);
    return queryResults;
  }

}