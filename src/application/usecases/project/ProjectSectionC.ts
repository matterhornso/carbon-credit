import { CreateProjectSectionC } from "../../../domain";
import { IProjectSectionCRepository } from "../../repositories/IProjectSectionCRepository";

export default class ProjectSectionC {
  private projectSectionCRepository: IProjectSectionCRepository;
  constructor(projectSectionCRepository: IProjectSectionCRepository) {
    this.projectSectionCRepository = projectSectionCRepository;
  }

  createSectionC(project: CreateProjectSectionC) {
    return this.projectSectionCRepository.createSectionC(project);
  }
  createStep1(project: CreateProjectSectionC) {
    return this.projectSectionCRepository.createStep1(project);
  }
}