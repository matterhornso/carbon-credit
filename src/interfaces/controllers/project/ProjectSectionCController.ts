import { MongoConnection } from '../../../infrastructure/database/MongoConnection'
import { Response } from '../../response/Response'
import { Controller, Get, Route, Example, Post, Body, Header, Request, Query, Security } from "tsoa"
import { ProjectSectionCRepository } from '../../database/ProjectSectionCRepository'
import ProjectSectionCUseCase from '../../../application/usecases/project/ProjectSectionC';
import { ProjectSectionC } from '../../../domain'
import { CreateProjectResponse } from '../ResponseInterface'
import { ProjectSectionCMongoConnection } from '../../../infrastructure/database/helper/database/ProjectSectionC'
import { IProjectSectionC } from '../../../domain/project_section_c/projectSectionCInterface';
import { ActivityType } from '..';
import { Util } from '../../utils/Util';

@Route('projectSectionC')
export class ProjectSectionCController extends Controller {
  private projectResource: string = "project";
  private projectRepository: ProjectSectionCRepository;
  constructor() {
    super();
    this.projectRepository = new ProjectSectionCRepository(new ProjectSectionCMongoConnection())
  }
  @Security("jwt")
  @Post("update")
  async update(@Body() data: IProjectSectionC,  @Request() request: any) {
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
    const project_useCase = new ProjectSectionCUseCase(this.projectRepository);
    let project_res;
    console.log(data)
    if(data.step1){
        project_res = await new ProjectSectionC().createStep1(data, project_useCase);
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
