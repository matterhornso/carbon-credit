import { CreateProjectSectionA } from "../../../domain";
import { IProjectSectionARepository } from "../../repositories/IProjectSectionARepository";

export default class ProjectSectionA {
  private projectSectionARepository: IProjectSectionARepository;
  constructor(projectSectionARepository: IProjectSectionARepository) {
    this.projectSectionARepository = projectSectionARepository;
  }

  createSectionA(project: CreateProjectSectionA) {
    return this.projectSectionARepository.createSectionA(project);
  }
  createStep1(project: CreateProjectSectionA) {
    return this.projectSectionARepository.createStep1(project);
  }
  createStep2(project: CreateProjectSectionA) {
    return this.projectSectionARepository.createStep2(project);
  }
  createStep3(project: CreateProjectSectionA) {
    return this.projectSectionARepository.createStep3(project);
  }
  createStep4(project: CreateProjectSectionA) {
    return this.projectSectionARepository.createStep4(project);
  }
  createStep5(project: CreateProjectSectionA) {
    return this.projectSectionARepository.createStep5(project);
  }
}