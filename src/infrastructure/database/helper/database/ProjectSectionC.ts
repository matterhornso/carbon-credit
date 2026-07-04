import { CreateProjectSectionC } from "../../../../domain";
import { IProjectSectionC } from "../../../../domain/project_section_c/projectSectionCInterface";
import { ProjectSectionCConnection } from "../../../../interfaces/database/IDBConnection"
import { ProjectSectionCModel } from "../../modal/project_section_c/project_section_c.model";

export class ProjectSectionCMongoConnection extends ProjectSectionCConnection {


  constructor() {
    super();
  }
  async createSectionC(project: CreateProjectSectionC): Promise<IProjectSectionC> {
    let project_res = await ProjectSectionCModel.createSectionC(project);
    return project_res;
  }

  async createStep1(project: CreateProjectSectionC): Promise<IProjectSectionC> {
    let project_res = await ProjectSectionCModel.createStep1(project);
    return project_res;
  }

}