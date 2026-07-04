import { CreateProject, UpdateProject } from "../../../domain";
import { IProjectRepository } from "../../repositories/IProjectRepository";

export default class Project {
  private projectRepository: IProjectRepository;
  constructor(projectRepository: IProjectRepository) {
    this.projectRepository = projectRepository;
  }

  createProject(project: CreateProject) {
    return this.projectRepository.createProject(project);
  }

  updateProject(project: UpdateProject) {
    return this.projectRepository.updateProject(project);
  }

  getAllProjects(filter?:any) {
    return this.projectRepository.getAllProjects(filter);
  }
  getProjectById(id: string) {
    return this.projectRepository.getProjectById(id);
  }


}