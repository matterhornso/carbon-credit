import { CreateProject, UpdateProject } from "../../domain";
import { IProjectInterface } from "../../domain/project/projectInterface";

export abstract class IProjectRepository {
  abstract createProject(project: CreateProject): Promise<IProjectInterface>
  abstract updateProject(project: UpdateProject): Promise<IProjectInterface>
  abstract getAllProjects(filter?:any): Promise<any>
  abstract getProjectById(id: string): Promise<any>
}