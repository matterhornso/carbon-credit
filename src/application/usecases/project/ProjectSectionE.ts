import { CreateProjectSectionE } from "../../../domain";
import { IProjectSectionERepository } from "../../repositories/IProjectSectionERepository";

export default class ProjectSectionE {
  private projectSectionERepository: IProjectSectionERepository;
  constructor(projectSectionERepository: IProjectSectionERepository) {
    this.projectSectionERepository = projectSectionERepository;
  }

  createSectionE(project: CreateProjectSectionE) {
    return this.projectSectionERepository.createSectionE(project);
  }
  createStep1(project: CreateProjectSectionE) {
    return this.projectSectionERepository.createStep1(project);
  }
  createStep2(project: CreateProjectSectionE) {
    return this.projectSectionERepository.createStep2(project);
  }
  createStep3(project: CreateProjectSectionE) {
    return this.projectSectionERepository.createStep3(project);
  }
  createStep4(project: CreateProjectSectionE) {
    return this.projectSectionERepository.createStep4(project);
  }
  createStep5(project: CreateProjectSectionE) {
    return this.projectSectionERepository.createStep5(project);
  }
  createStep6(project: CreateProjectSectionE) {
    return this.projectSectionERepository.createStep6(project);
  }
  createStep7(project: CreateProjectSectionE) {
    return this.projectSectionERepository.createStep7(project);
  }
}