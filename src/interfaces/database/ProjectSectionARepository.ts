
import { IProjectSectionARepository } from '../../application/repositories/IProjectSectionARepository'
import { CreateProjectSectionA } from '../../domain'
import { ProjectSectionAConnection } from './IDBConnection'
import { IProjectSectionA } from "../../domain/project_section_a/projectSectionAInterface";
export class ProjectSectionARepository extends IProjectSectionARepository {
  private connection: ProjectSectionAConnection

  constructor(connection: ProjectSectionAConnection) {
    super()
    this.connection = connection
  }

  async createSectionA(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let queryResults = await this.connection.createSectionA(project);
    return queryResults;
  }

  async createStep1(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let queryResults = await this.connection.createStep1(project);
    return queryResults;
  }

  async createStep2(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let queryResults = await this.connection.createStep2(project);
    return queryResults;
  }

  async createStep3(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let queryResults = await this.connection.createStep3(project);
    return queryResults;
  }

  async createStep4(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let queryResults = await this.connection.createStep4(project);
    return queryResults;
  }

  async createStep5(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let queryResults = await this.connection.createStep5(project);
    return queryResults;
  }
}