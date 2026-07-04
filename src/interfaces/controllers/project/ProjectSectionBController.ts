import { MongoConnection } from '../../../infrastructure/database/MongoConnection'
import { Response } from '../../response/Response'
import { Controller, Get, Route, Example, Post, Body, Header, Request, Query, Security } from "tsoa"
import { ProjectSectionBRepository } from '../../database/ProjectSectionBRepository'
import ProjectSectionBUseCase from '../../../application/usecases/project/ProjectSectionB';
import { ProjectSectionB } from '../../../domain'
import { CreateProjectResponse } from '../ResponseInterface'
import { ProjectSectionBMongoConnection } from '../../../infrastructure/database/helper/database/ProjectSectionB'
import { IProjectSectionB } from '../../../domain/project_section_b/projectSectionBInterface';
import { ActivityType } from '..';
import { Util } from '../../utils/Util';

@Route('projectSectionB')
export class ProjectSectionBController extends Controller {
  private projectResource: string = "project";
  private projectRepository: ProjectSectionBRepository;
  constructor() {
    super();
    this.projectRepository = new ProjectSectionBRepository(new ProjectSectionBMongoConnection())
  }
  @Security("jwt")
  @Post("update")
  async update(@Body() data: IProjectSectionB, @Request() request: any) {
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
    const project_useCase = new ProjectSectionBUseCase(this.projectRepository);
    let project_res;
    console.log(data)
    if(data.step1){
        project_res = await new ProjectSectionB().createStep1(data, project_useCase);
    }
    if(data.step2){
        project_res = await new ProjectSectionB().createStep2(data, project_useCase);
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
