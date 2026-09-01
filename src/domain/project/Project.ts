import { IProjectInterface } from './projectInterface';
import { CreateProject } from "./CreateProject";
import { UpdateProject } from "./UpdateProject";
import { ProjectUseCase } from '../../application/usecases/index';

export class Project {
  create(project: IProjectInterface, useCase: ProjectUseCase) {
    let createProject = new CreateProject(project);
    return useCase.createProject(createProject)
  }

  update(data: { id: string } & IProjectInterface, useCase: ProjectUseCase) {
    let updateProject = new UpdateProject(data);
    return useCase.updateProject(updateProject)
  }
}
