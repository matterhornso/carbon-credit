import { CreateProjectSectionE } from "../../../../domain";
import { IProjectSectionE } from "../../../../domain/project_section_e/projectSectionEInterface";
import { ProjectSectionEConnection } from "../../../../interfaces/database/IDBConnection"
import { ProjectSectionEModel } from "../../modal/project_section_e/project_section_e.model";

export class ProjectSectionEMongoConnection extends ProjectSectionEConnection {


  constructor() {
    super();
  }
  async createSectionE(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let project_res = await ProjectSectionEModel.createSectionE(project);
    return project_res;
  }

  async createStep1(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let project_res = await ProjectSectionEModel.createStep1(project);
    return project_res;
  }
  async createStep2(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let project_res = await ProjectSectionEModel.createStep2(project);
    return project_res;
  }

  async createStep3(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let project_res = await ProjectSectionEModel.createStep3(project);
    return project_res;
  }

  async createStep4(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let project_res = await ProjectSectionEModel.createStep4(project);
    return project_res;
  }

  async createStep5(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let project_res = await ProjectSectionEModel.createStep5(project);
    return project_res;
  }

  async createStep6(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let project_res = await ProjectSectionEModel.createStep6(project);
    return project_res;
  }

  async createStep7(project: CreateProjectSectionE): Promise<IProjectSectionE> {
    let project_res = await ProjectSectionEModel.createStep7(project);
    return project_res;
  }

}