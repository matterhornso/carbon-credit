import { CreateProjectSectionA } from "../../../../domain";
import { IProjectSectionA } from "../../../../domain/project_section_a/projectSectionAInterface";
import { ProjectSectionAConnection } from "../../../../interfaces/database/IDBConnection"
import { ProjectSectionAModel } from "../../modal/project_section_a/project_section_a.model";

export class ProjectSectionAMongoConnection extends ProjectSectionAConnection {


  constructor() {
    super();
  }
  async createSectionA(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let project_res = await ProjectSectionAModel.createSectionA(project);
    return project_res;
  }

  async createStep1(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let project_res = await ProjectSectionAModel.createStep1(project);
    return project_res;
  }
  async createStep2(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let project_res = await ProjectSectionAModel.createStep2(project);
    return project_res;
  }
  async createStep3(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let project_res = await ProjectSectionAModel.createStep3(project);
    return project_res;
  }
  async createStep4(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let project_res = await ProjectSectionAModel.createStep4(project);
    return project_res;
  }
  async createStep5(project: CreateProjectSectionA): Promise<IProjectSectionA> {
    let project_res = await ProjectSectionAModel.createStep5(project);
    return project_res;
  }

}