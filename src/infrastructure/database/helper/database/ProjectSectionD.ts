import { CreateProjectSectionD } from "../../../../domain";
import { IProjectSectionD } from "../../../../domain/project_section_d/projectSectionDInterface";
import { ProjectSectionDConnection } from "../../../../interfaces/database/IDBConnection"
import { ProjectSectionDModel } from "../../modal/project_section_d/project_section_d.model";

export class ProjectSectionDMongoConnection extends ProjectSectionDConnection {


  constructor() {
    super();
  }
  async createSectionD(project: CreateProjectSectionD): Promise<IProjectSectionD> {
    let project_res = await ProjectSectionDModel.createSectionD(project);
    return project_res;
  }

  async createStep1(project: CreateProjectSectionD): Promise<IProjectSectionD> {
    let project_res = await ProjectSectionDModel.createStep1(project);
    return project_res;
  }
  async createStep2(project: CreateProjectSectionD): Promise<IProjectSectionD> {
    let project_res = await ProjectSectionDModel.createStep2(project);
    return project_res;
  }

  async createStep3(project: CreateProjectSectionD): Promise<IProjectSectionD> {
    let project_res = await ProjectSectionDModel.createStep3(project);
    return project_res;
  }

}