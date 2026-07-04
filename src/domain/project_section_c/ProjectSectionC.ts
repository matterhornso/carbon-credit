import { IProjectSectionC } from './projectSectionCInterface';
import { CreateProjectSectionC } from "../index"
import { ProjectSectionCUseCase } from '../../application/usecases';

export class ProjectSectionC {
  create(project: IProjectSectionC, useCase: ProjectSectionCUseCase) {
    let createSectionA = new CreateProjectSectionC().createSectionC(project);
    return useCase.createSectionC(createSectionA)
  }
  createStep1(project: IProjectSectionC, useCase: ProjectSectionCUseCase) {
    let createSectionAStep1 = new CreateProjectSectionC().createStep1(project)
    return useCase.createStep1(createSectionAStep1)
  }
}