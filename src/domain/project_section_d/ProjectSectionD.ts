import { IProjectSectionD } from './projectSectionDInterface';
import { CreateProjectSectionD } from "../index"
import { ProjectSectionDUseCase } from '../../application/usecases';

export class ProjectSectionD {
  create(project: IProjectSectionD, useCase: ProjectSectionDUseCase) {
    let createSectionD = new CreateProjectSectionD().createSectionD(project);
    return useCase.createSectionD(createSectionD)
  }
  createStep1(project: IProjectSectionD, useCase: ProjectSectionDUseCase) {
    let createSectionDStep1 = new CreateProjectSectionD().createStep1(project)
    return useCase.createStep1(createSectionDStep1)
  }
  createStep2(project: IProjectSectionD, useCase: ProjectSectionDUseCase) {
    let createSectionDStep2 = new CreateProjectSectionD().createStep2(project)
    return useCase.createStep2(createSectionDStep2)
  }
  createStep3(project: IProjectSectionD, useCase: ProjectSectionDUseCase) {
    let createSectionDStep3 = new CreateProjectSectionD().createStep3(project)
    return useCase.createStep3(createSectionDStep3)
  }
}