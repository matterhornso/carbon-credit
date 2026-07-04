import { IProjectInterface } from './projectInterface';
import { CreateProject, UpdateProject } from "../index"
import { ProjectUseCase } from '../../application//usecases/index';
export class Project {
  create(project: IProjectInterface, useCase: ProjectUseCase) {
    let createProject = new CreateProject(project);
    return useCase.createProject(createProject)
  }

  update(project: IProjectInterface, useCase: ProjectUseCase) {
    let updateProject = new UpdateProject(project);
    return useCase.updateProject(updateProject)
  }
}