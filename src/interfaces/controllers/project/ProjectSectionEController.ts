import { MongoConnection } from '../../../infrastructure/database/MongoConnection'
import { Response } from '../../response/Response'
import { Controller, Get, Route, Example, Post, Body, Header, Request, Query, Security } from "tsoa"
import { ProjectSectionERepository } from '../../database/ProjectSectionERepository'
import ProjectSectionEUseCase from '../../../application/usecases/project/ProjectSectionE';
import { ProjectSectionE } from '../../../domain'
import { CreateProjectResponse } from '../ResponseInterface'
import { ProjectSectionEMongoConnection } from '../../../infrastructure/database/helper/database/ProjectSectionE'
import { IProjectSectionE } from '../../../domain/project_section_e/projectSectionEInterface';
import { ActivityType } from '..';
import { Util } from '../../utils/Util';

@Route('projectSectionE')
export class ProjectSectionEController extends Controller {
  private projectResource: string = "project";
  private projectRepository: ProjectSectionERepository;
  constructor() {
    super();
    this.projectRepository = new ProjectSectionERepository(new ProjectSectionEMongoConnection())
  }
  @Security("jwt")
  @Post("update")
  async update(@Body() data: IProjectSectionE, @Request() request: any) {
    let _user: any = await new Util().getUserInfo(request.user);
    // TODO handle permission not found
    let user_shine_name = _user.shineName;
    let user_public_key = _user.shineKey;
    //let refiner = _user._id;
    let organization_id = _user.departmentId.organization_id;

    let _department: any = await new Util().getDepartmentInfo(request.user);

    let action: string = ActivityType.CREATE;
    let isOwnerOrMember: boolean = true;
    let resource: string = _department._id + ":" + this.projectResource;

    let hasPermission: boolean = await new Util().hasPermission(request.user, isOwnerOrMember, action, _department.roles, resource);

    if (hasPermission != true) {
      this.setStatus(400);
      return new Response().sendResponseFailure("User Not Authorized", false);
    }
    const project_useCase = new ProjectSectionEUseCase(this.projectRepository);
    let project_res;
    console.log(data)
    if (data.step1) {
      project_res = await new ProjectSectionE().createStep1(data, project_useCase);
    }
    if (data.step2) {
      project_res = await new ProjectSectionE().createStep2(data, project_useCase);
    }
    if (data.step3) {
      project_res = await new ProjectSectionE().createStep3(data, project_useCase);
    }
    if (data.step4) {
      project_res = await new ProjectSectionE().createStep4(data, project_useCase);
    }
    if (data.step5) {
      project_res = await new ProjectSectionE().createStep5(data, project_useCase);
    }
    if (data.step6) {
      project_res = await new ProjectSectionE().createStep6(data, project_useCase);
    }
    if (data.step7) {
      project_res = await new ProjectSectionE().createStep7(data, project_useCase);
    }

    if (project_res) {
      let res_body = new CreateProjectResponse();
      res_body.uuid = project_res.uuid
      return new Response().sendResponseSuccess(res_body, true);
    } else {
      return new Response().sendResponseFailure("something went wrong ", false);
    }
  }
}
