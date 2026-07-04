import { Response } from '../../response/Response'
import { Controller, Get, Route, Example, Post, Body, Header, Request, Query, Security } from "tsoa"
import { ProjectSectionDRepository } from '../../database/ProjectSectionDRepository'
import ProjectSectionDUseCase from '../../../application/usecases/project/ProjectSectionD';
import { ProjectSectionD } from '../../../domain'
import { CreateProjectResponse } from '../ResponseInterface'
import { ProjectSectionDMongoConnection } from '../../../infrastructure/database/helper/database/ProjectSectionD'
import { IProjectSectionD } from '../../../domain/project_section_d/projectSectionDInterface';
import { ActivityType } from '..';
import { Util } from '../../utils/Util';

@Route('projectSectionD')
export class ProjectSectionDController extends Controller {
  private projectResource: string = "project";
  private projectRepository: ProjectSectionDRepository;
  constructor() {
    super();
    this.projectRepository = new ProjectSectionDRepository(new ProjectSectionDMongoConnection())
  }
  @Security("jwt")
  @Post("update")
  async update(@Body() data: IProjectSectionD, @Request() request: any) {
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
    const project_useCase = new ProjectSectionDUseCase(this.projectRepository);
    let project_res;
    if(data.step1){
        project_res = await new ProjectSectionD().createStep1(data, project_useCase);
    }
    if(data.step2){
        project_res = await new ProjectSectionD().createStep2(data, project_useCase);
    }
    if(data.step3){
        project_res = await new ProjectSectionD().createStep3(data, project_useCase);
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
