import { CreateProjectSectionD } from "../../../domain";
import { IProjectSectionDRepository } from "../../repositories/IProjectSectionDRepository";

export default class ProjectSectionD {
  private projectSectionDRepository: IProjectSectionDRepository;
  constructor(projectSectionDRepository: IProjectSectionDRepository) {
    this.projectSectionDRepository = projectSectionDRepository;
  }

  createSectionD(project: CreateProjectSectionD) {
    return this.projectSectionDRepository.createSectionD(project);
  }
  createStep1(project: CreateProjectSectionD) {
    return this.projectSectionDRepository.createStep1(project);
  }
  createStep2(project: CreateProjectSectionD) {
    return this.projectSectionDRepository.createStep2(project);
  }
  createStep3(project: CreateProjectSectionD) {
    return this.projectSectionDRepository.createStep3(project);
  }
}