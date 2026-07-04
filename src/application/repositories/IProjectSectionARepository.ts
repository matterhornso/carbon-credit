import { CreateProjectSectionA } from "../../domain";
import { IProjectSectionA } from "../../domain/project_section_a/projectSectionAInterface";

export abstract class IProjectSectionARepository {
  abstract createSectionA(project: CreateProjectSectionA): Promise<IProjectSectionA>
  abstract createStep1(project: CreateProjectSectionA): Promise<IProjectSectionA>
  abstract createStep2(project: CreateProjectSectionA): Promise<IProjectSectionA>
  abstract createStep3(project: CreateProjectSectionA): Promise<IProjectSectionA>
  abstract createStep4(project: CreateProjectSectionA): Promise<IProjectSectionA>
  abstract createStep5(project: CreateProjectSectionA): Promise<IProjectSectionA>  
}