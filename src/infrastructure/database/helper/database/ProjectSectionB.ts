import { CreateProjectSectionB } from "../../../../domain";
import { IProjectSectionB } from "../../../../domain/project_section_b/projectSectionBInterface";
import { ProjectSectionBConnection } from "../../../../interfaces/database/IDBConnection"
import { ProjectSectionBModel } from "../../modal/project_section_b/project_section_b.model";

export class ProjectSectionBMongoConnection extends ProjectSectionBConnection {


  constructor() {
    super();
  }
  async createSectionB(project: CreateProjectSectionB): Promise<IProjectSectionB> {
    let project_res = await ProjectSectionBModel.createSectionB(project);
    return project_res;
  }

  async createStep1(project: CreateProjectSectionB): Promise<IProjectSectionB> {
    let project_res = await ProjectSectionBModel.createStep1(project);
    return project_res;
  }
  async createStep2(project: CreateProjectSectionB): Promise<IProjectSectionB> {
    let project_res = await ProjectSectionBModel.createStep2(project);
    return project_res;
  }

}