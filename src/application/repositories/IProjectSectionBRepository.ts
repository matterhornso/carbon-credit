import { CreateProjectSectionA } from "../../domain";
import { IProjectSectionB } from "../../domain/project_section_b/projectSectionBInterface";

export abstract class IProjectSectionBRepository {
  abstract createSectionB(project: IProjectSectionB): Promise<IProjectSectionB>
  abstract createStep1(project: IProjectSectionB): Promise<IProjectSectionB>
  abstract createStep2(project: IProjectSectionB): Promise<IProjectSectionB>
}