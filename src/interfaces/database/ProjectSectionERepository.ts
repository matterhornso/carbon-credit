
import { IProjectSectionERepository } from '../../application/repositories/IProjectSectionERepository'
import { CreateProjectSectionE } from '../../domain'
import { ProjectSectionEConnection } from './IDBConnection'
import { IProjectSectionE } from "../../domain/project_section_e/projectSectionEInterface";
export class ProjectSectionERepository extends IProjectSectionERepository {
  private connection: ProjectSectionEConnection

  constructor(connection: ProjectSectionEConnection) {
    super()
    this.connection = connection
  }

  async createSectionE(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let queryResults = await this.connection.createSectionE(project);
    return queryResults;
  }

  async createStep1(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let queryResults = await this.connection.createStep1(project);
    return queryResults;
  }

  async createStep2(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let queryResults = await this.connection.createStep2(project);
    return queryResults;
  }

  async createStep3(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let queryResults = await this.connection.createStep3(project);
    return queryResults;
  }

  async createStep4(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let queryResults = await this.connection.createStep4(project);
    return queryResults;
  }

  async createStep5(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let queryResults = await this.connection.createStep5(project);
    return queryResults;
  }

  async createStep6(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let queryResults = await this.connection.createStep6(project);
    return queryResults;
  }

  async createStep7(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let queryResults = await this.connection.createStep7(project);
    return queryResults;
  }

}