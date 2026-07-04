import { CreateProjectSectionA } from "../../domain";
import { IProjectSectionE } from "../../domain/project_section_e/projectSectionEInterface";

export abstract class IProjectSectionERepository {
  abstract createSectionE(project: IProjectSectionE): Promise<IProjectSectionE>
  abstract createStep1(project: IProjectSectionE): Promise<IProjectSectionE>
  abstract createStep2(project: IProjectSectionE): Promise<IProjectSectionE>
  abstract createStep3(project: IProjectSectionE): Promise<IProjectSectionE>
  abstract createStep4(project: IProjectSectionE): Promise<IProjectSectionE>
  abstract createStep5(project: IProjectSectionE): Promise<IProjectSectionE>
  abstract createStep6(project: IProjectSectionE): Promise<IProjectSectionE>
  abstract createStep7(project: IProjectSectionE): Promise<IProjectSectionE>
}