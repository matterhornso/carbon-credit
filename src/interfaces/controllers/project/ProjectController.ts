import { MongoConnection } from '../../../infrastructure/database/MongoConnection'
import { ProjectMongoConnection } from '../../../infrastructure/database/helper/database/Project'
import { Response } from '../../response/Response'
import * as fs from 'fs'
import { Controller, Get, Route, Example, Post, Body, Header, Request, Query, Security } from "tsoa"
import { ProjectRepository } from '../../database/ProjectRepository'
import { ProjectSectionAUseCase, ProjectSectionBUseCase, ProjectSectionCUseCase, ProjectSectionDUseCase, ProjectSectionEUseCase, ProjectUseCase } from '../../../application/usecases/index';
import { Project, ProjectSectionA, ProjectSectionB, ProjectSectionC, ProjectSectionD, ProjectSectionE } from '../../../domain'
import { CreateProjectResponse } from '../ResponseInterface'
import { ProjectSectionARepository } from '../../database/ProjectSectionARepository'
import { ProjectSectionAMongoConnection } from '../../../infrastructure/database/helper/database/ProjectSectionA'
import { ProjectSectionBRepository } from '../../database/ProjectSectionBRepository'
import { ProjectSectionCRepository } from '../../database/ProjectSectionCRepository'
import { ProjectSectionDRepository } from '../../database/ProjectSectionDRepository'
import { ProjectSectionERepository } from '../../database/ProjectSectionERepository'
import { ProjectSectionBMongoConnection } from '../../../infrastructure/database/helper/database/ProjectSectionB'
import { ProjectSectionCMongoConnection } from '../../../infrastructure/database/helper/database/ProjectSectionC'
import { ProjectSectionDMongoConnection } from '../../../infrastructure/database/helper/database/ProjectSectionD'
import { ProjectSectionEMongoConnection } from '../../../infrastructure/database/helper/database/ProjectSectionE'
import { IProjectInterface } from '../../../domain/project/projectInterface'
import { ICreateProjectRequest } from '../RequestInterfaces'
import { ActivityType } from '..'
import { Util } from '../../utils/Util'
import { ParallelHasher } from 'ts-md5/dist/parallel_hasher';
import path from 'path'
import CryptoJS from 'crypto-js'


@Route('project')
export class ProjectController extends Controller {
  private projectResource: string = "project";
  private projectRepository: ProjectRepository;
  private projectSectionARepository: ProjectSectionARepository;
  private projectSectionBRepository: ProjectSectionBRepository;
  private projectSectionCRepository: ProjectSectionCRepository;
  private projectSectionDRepository: ProjectSectionDRepository;
  private projectSectionERepository: ProjectSectionERepository;
  constructor() {
    super();
    this.projectRepository = new ProjectRepository(new ProjectMongoConnection())
    this.projectSectionARepository = new ProjectSectionARepository(new ProjectSectionAMongoConnection())
    this.projectSectionBRepository = new ProjectSectionBRepository(new ProjectSectionBMongoConnection())
    this.projectSectionCRepository = new ProjectSectionCRepository(new ProjectSectionCMongoConnection())
    this.projectSectionDRepository = new ProjectSectionDRepository(new ProjectSectionDMongoConnection())
    this.projectSectionERepository = new ProjectSectionERepository(new ProjectSectionEMongoConnection())

  }
  @Security("jwt")
  @Post("create")
  async create(@Body() data: ICreateProjectRequest, @Request() request: any) {
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
    const project_useCase = new ProjectUseCase(this.projectRepository);
    const project_sectiona_useCase = new ProjectSectionAUseCase(this.projectSectionARepository);
    const project_sectionb_useCase = new ProjectSectionBUseCase(this.projectSectionBRepository);
    const project_sectionc_useCase = new ProjectSectionCUseCase(this.projectSectionCRepository);
    const project_sectiond_useCase = new ProjectSectionDUseCase(this.projectSectionDRepository);
    const project_sectione_useCase = new ProjectSectionEUseCase(this.projectSectionERepository);
    let user = { name: _user.fullName, email: _user.email, uuid: _user.uuid, user_id: _user._id }
    let project_res: any = await new Project().create({ ...data, ...user }, project_useCase);
    if (project_res) {
      let res_body = new CreateProjectResponse();
      res_body.uuid = project_res.uuid;
      let uuid = { project_id: project_res.uuid }
      let sectionA = await new ProjectSectionA().create(uuid, project_sectiona_useCase);
      let sectionB = await new ProjectSectionB().create(uuid, project_sectionb_useCase);
      let sectionC = await new ProjectSectionC().create(uuid, project_sectionc_useCase);
      let sectionD = await new ProjectSectionD().create(uuid, project_sectiond_useCase);
      let sectionE = await new ProjectSectionE().create(uuid, project_sectione_useCase);
      console.log(sectionA, sectionB, sectionC, sectionD, sectionE, "sectiona")
      if (sectionA && sectionB && sectionC && sectionD && sectionE) {
        let updateProject = await new Project().update({
          uuid: project_res.uuid, section_a: sectionA._id, section_b: sectionB._id,
          section_c: sectionC._id, section_d: sectionD._id, section_e: sectionE._id
        }, project_useCase)
        console.log(updateProject)
      }
      return new Response().sendResponseSuccess(res_body, true);
    } else {
      return new Response().sendResponseFailure("something went wrong ", false);
    }
  }

  @Example({
    "success": true,
    "error": [],
    "data": {
    }
  })
  @Get("getProjectById")
  @Security("jwt")
  async getProjectById(@Request() request: any, @Query() id: string) {
    try {
      // let _user: any = await new Util().getUserInfo(request.user);
      // // TODO handle permission not found
      // let user_shine_name = _user.shineName;
      // let user_public_key = _user.shineKey;
      // let organization_id = _user.departmentId.organization_id;
      // let _department: any = await new Util().getDepartmentInfo(request.user);
      // let action: string = ActivityType.READ;
      // let isOwnerOrMember: boolean = true;
      // let resource: string = _department._id + ":" + this.projectResource;
      // // console.log('resource', resource)
      // let hasPermission: boolean = await new Util().hasPermission(request.user, isOwnerOrMember, action, _department.roles, resource);
      // if (hasPermission != true) {
      //   this.setStatus(400);
      //   return new Response().sendResponseFailure("User Not Authorized", false);
      // }

      const project_useCase = new ProjectUseCase(this.projectRepository);
      let result = await project_useCase.getProjectById(id)
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure('something went wrong' + Error, false);
    }
  }


  /**
   * * get all companies
   * */
  @Example({
    "success": true,
    "error": [],
    "data": {
    }
  })
  @Get("getAllProjects")
  //@Security("jwt")
  async getAllProjects(@Request() request: any, @Query() user_id?: string) {
    try {
      // //console.log('sourcing', sourcing)
      // let _user: any = await new Util().getUserInfo(request.user);
      // // TODO handle permission not found
      // let _department: any = await new Util().getDepartmentInfo(request.user);
      // let action: string = ActivityType.READ;
      // let isOwnerOrMember: boolean = true;
      // let resource: string = _department._id + ":" + this.projectResource;
      // console.log('resource', resource)
      // let hasPermission: boolean = await new Util().hasPermission(request.user, isOwnerOrMember, action, _department.roles, resource);
      // if (hasPermission != true) {
      //   this.setStatus(400);
      //   return new Response().sendResponseFailure("User Not Authorized", false);
      // }
      let filter: any = {}
      if (user_id) {
        filter["user_id"] = user_id
      }
      const project_useCase = new ProjectUseCase(this.projectRepository);
      let result = await project_useCase.getAllProjects(filter)
      // const dirContents = fs.readdirSync(__dirname);
      // console.log(dirContents);

      // const fileContents = fs.readFileSync(
      //   path.join(__dirname, './../ResponseInterface.js'),
      //   {
      //     encoding: 'utf-8',
      //   },
      // );
      // const hashSum = CryptoJS.HmacMD5(fileContents,"123");

      // console.log(hashSum.toString(), "hashhhhhh")
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong" + Error, false);
    }
  }
}
