import { CreateProjectSectionA } from "../../domain";
import { IProjectSectionC } from "../../domain/project_section_c/projectSectionCInterface";

export abstract class IProjectSectionCRepository {
  abstract createSectionC(project: IProjectSectionC): Promise<IProjectSectionC>
  abstract createStep1(project: IProjectSectionC): Promise<IProjectSectionC>
}