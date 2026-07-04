import { CreateProjectSectionB } from "../../../domain";
import { IProjectSectionBRepository } from "../../repositories/IProjectSectionBRepository";

export default class ProjectSectionB {
  private projectSectionBRepository: IProjectSectionBRepository;
  constructor(projectSectionBRepository: IProjectSectionBRepository) {
    this.projectSectionBRepository = projectSectionBRepository;
  }

  createSectionB(project: CreateProjectSectionB) {
    return this.projectSectionBRepository.createSectionB(project);
  }
  createStep1(project: CreateProjectSectionB) {
    return this.projectSectionBRepository.createStep1(project);
  }
  createStep2(project: CreateProjectSectionB) {
    return this.projectSectionBRepository.createStep2(project);
  }
}