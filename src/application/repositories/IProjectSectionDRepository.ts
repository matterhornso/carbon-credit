import { CreateProjectSectionD } from "../../domain";
import { IProjectSectionD } from "../../domain/project_section_d/projectSectionDInterface";

export abstract class IProjectSectionDRepository {
  abstract createSectionD(project: CreateProjectSectionD): Promise<IProjectSectionD>
  abstract createStep1(project: CreateProjectSectionD): Promise<IProjectSectionD>
  abstract createStep2(project: CreateProjectSectionD): Promise<IProjectSectionD>
  abstract createStep3(project: CreateProjectSectionD): Promise<IProjectSectionD>
}