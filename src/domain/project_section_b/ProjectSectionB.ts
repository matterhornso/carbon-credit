import { IProjectSectionB } from './projectSectionBInterface';
import { CreateProjectSectionB } from "../index"
import { ProjectSectionBUseCase } from '../../application/usecases';

export class ProjectSectionB {
  create(project: IProjectSectionB, useCase: ProjectSectionBUseCase) {
    let createSectionB = new CreateProjectSectionB().createSectionB(project);
    return useCase.createSectionB(createSectionB)
  }
  createStep1(project: IProjectSectionB, useCase: ProjectSectionBUseCase) {
    let createSectionAStep1 = new CreateProjectSectionB().createStep1(project)
    return useCase.createStep1(createSectionAStep1)
  }
  createStep2(project: IProjectSectionB, useCase: ProjectSectionBUseCase) {
    let createSectionAStep2 = new CreateProjectSectionB().createStep2(project)
    return useCase.createStep2(createSectionAStep2)
  }
}