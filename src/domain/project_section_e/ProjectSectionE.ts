import { IProjectSectionE } from './projectSectionEInterface';
import { CreateProjectSectionE } from "../index"
import { ProjectSectionEUseCase } from '../../application/usecases';

export class ProjectSectionE {
  create(project: IProjectSectionE, useCase: ProjectSectionEUseCase) {
    let createSectionA = new CreateProjectSectionE().createSectionE(project);
    return useCase.createSectionE(createSectionA)
  }
  createStep1(project: IProjectSectionE, useCase: ProjectSectionEUseCase) {
    let createSectionAStep1 = new CreateProjectSectionE().createStep1(project)
    return useCase.createStep1(createSectionAStep1)
  }
  createStep2(project: IProjectSectionE, useCase: ProjectSectionEUseCase) {
    let createSectionAStep2 = new CreateProjectSectionE().createStep2(project)
    return useCase.createStep2(createSectionAStep2)
  }
  createStep3(project: IProjectSectionE, useCase: ProjectSectionEUseCase) {
    let createSectionAStep3 = new CreateProjectSectionE().createStep3(project)
    return useCase.createStep3(createSectionAStep3)
  }
  createStep4(project: IProjectSectionE, useCase: ProjectSectionEUseCase) {
    let createSectionAStep4 = new CreateProjectSectionE().createStep4(project)
    return useCase.createStep4(createSectionAStep4)
  }
  createStep5(project: IProjectSectionE, useCase: ProjectSectionEUseCase) {
    let createSectionAStep5 = new CreateProjectSectionE().createStep5(project)
    return useCase.createStep5(createSectionAStep5)
  }
  createStep6(project: IProjectSectionE, useCase: ProjectSectionEUseCase) {
    let createSectionAStep6 = new CreateProjectSectionE().createStep6(project)
    return useCase.createStep6(createSectionAStep6)
  }
  createStep7(project: IProjectSectionE, useCase: ProjectSectionEUseCase) {
    let createSectionAStep7 = new CreateProjectSectionE().createStep7(project)
    return useCase.createStep7(createSectionAStep7)
  }
}