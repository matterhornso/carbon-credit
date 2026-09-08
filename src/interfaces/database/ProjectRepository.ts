import { IProjectRepository } from '../../application/repositories/IProjectRepository'
import { CreateProject, UpdateProject } from '../../domain'
import { TenantScope } from '../../domain/tenant/TenantScope'
import { ProjectConnection } from './IDBConnection'
import { IProjectInterface } from "../../domain/project/projectInterface";

// The scope is bound once, at construction, and supplied to every call. That
// keeps the abstract repository signature the usecases depend on unchanged —
// no usecase has to know tenancy exists — while making it impossible to reach
// the database without a tenant.
export class ProjectRepository extends IProjectRepository {
  private connection: ProjectConnection
  private scope: TenantScope

  constructor(connection: ProjectConnection, scope: TenantScope) {
    super()
    this.connection = connection
    this.scope = scope
  }

  async createProject(project: CreateProject): Promise<IProjectInterface> {
    return await this.connection.createProject(this.scope.tenantId, project);
  }

  async updateProject(project: UpdateProject): Promise<IProjectInterface | null> {
    return await this.connection.updateProject(this.scope.tenantId, project);
  }

  async transitionStatus(id: string, status: string): Promise<IProjectInterface | null> {
    return await this.connection.transitionStatus(this.scope.tenantId, id, status);
  }

  async setCaseDocumentId(id: string, caseDocumentId: string): Promise<IProjectInterface | null> {
    return await this.connection.setCaseDocumentId(this.scope.tenantId, id, caseDocumentId);
  }

  async addAttachment(id: string, sourceDocumentId: string): Promise<IProjectInterface | null> {
    return await this.connection.addAttachment(this.scope.tenantId, id, sourceDocumentId);
  }

  async getAllProjects(filter?: any): Promise<IProjectInterface[]> {
    return await this.connection.getAllProjects(this.scope.tenantId, filter);
  }

  async getProjectById(id: string): Promise<IProjectInterface | null> {
    return await this.connection.getProjectById(this.scope.tenantId, id);
  }
}
