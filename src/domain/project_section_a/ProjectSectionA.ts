import { IProjectSectionA } from './projectSectionAInterface';
import { CreateProjectSectionA } from "../index"
import { ProjectSectionAUseCase } from '../../application/usecases';

export class ProjectSectionA {
  create(project: IProjectSectionA, useCase: ProjectSectionAUseCase) {
    let createSectionA = new CreateProjectSectionA().createSectionA(project);
    return useCase.createSectionA(createSectionA)
  }
  createStep1(project: IProjectSectionA, useCase: ProjectSectionAUseCase) {
    let createSectionAStep1 = new CreateProjectSectionA().createStep1(project)
    return useCase.createStep1(createSectionAStep1)
  }
  createStep2(project: IProjectSectionA, useCase: ProjectSectionAUseCase) {
    let createSectionAStep2 = new CreateProjectSectionA().createStep2(project)
    return useCase.createStep2(createSectionAStep2)
  }
  createStep3(project: IProjectSectionA, useCase: ProjectSectionAUseCase) {
    let createSectionAStep3 = new CreateProjectSectionA().createStep3(project)
    return useCase.createStep3(createSectionAStep3)
  }
  createStep4(project: IProjectSectionA, useCase: ProjectSectionAUseCase) {
    let createSectionAStep4 = new CreateProjectSectionA().createStep4(project)
    return useCase.createStep4(createSectionAStep4)
  }
  createStep5(project: IProjectSectionA, useCase: ProjectSectionAUseCase) {
    let createSectionAStep5 = new CreateProjectSectionA().createStep5(project)
    return useCase.createStep5(createSectionAStep5)
  }
}