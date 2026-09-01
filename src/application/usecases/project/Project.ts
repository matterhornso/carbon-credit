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

  transitionStatus(id: string, status: string) {
    return this.projectRepository.transitionStatus(id, status);
  }

  setCaseDocumentId(id: string, caseDocumentId: string) {
    return this.projectRepository.setCaseDocumentId(id, caseDocumentId);
  }

  addAttachment(id: string, sourceDocumentId: string) {
    return this.projectRepository.addAttachment(id, sourceDocumentId);
  }

  getAllProjects(filter?: any) {
    return this.projectRepository.getAllProjects(filter);
  }
  getProjectById(id: string) {
    return this.projectRepository.getProjectById(id);
  }
}
