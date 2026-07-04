
import { IProjectSectionDRepository } from '../../application/repositories/IProjectSectionDRepository'
import { CreateProjectSectionD } from '../../domain'
import { ProjectSectionDConnection } from './IDBConnection'
import { IProjectSectionD } from "../../domain/project_section_d/projectSectionDInterface";
export class ProjectSectionDRepository extends IProjectSectionDRepository {
  private connection: ProjectSectionDConnection

  constructor(connection: ProjectSectionDConnection) {
    super()
    this.connection = connection
  }

  async createSectionD(project: CreateProjectSectionD): Promise<IProjectSectionD> {
    let queryResults = await this.connection.createSectionD(project);
    return queryResults;
  }

  async createStep1(project: CreateProjectSectionD): Promise<IProjectSectionD> {
    let queryResults = await this.connection.createStep1(project);
    return queryResults;
  }

  async createStep2(project: CreateProjectSectionD): Promise<IProjectSectionD> {
    let queryResults = await this.connection.createStep2(project);
    return queryResults;
  }

  async createStep3(project: CreateProjectSectionD): Promise<IProjectSectionD> {
    let queryResults = await this.connection.createStep3(project);
    return queryResults;
  }
}