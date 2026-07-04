import { MongoConnection } from '../../../infrastructure/database/MongoConnection'
import { ReportMongoConnection } from '../../../infrastructure/database/helper/database/Report'
import { Response } from '../../response/Response'
import { Controller, Get, Route, Example, Post, Body, Header, Request, Query, Security } from "tsoa"
import { ReportRepository } from '../../database/ReportRepository'
import { Report} from '../../../domain'
import { IReportInterface } from '../../../domain/report/reportInterface'
import { ICreateReportRequest } from '../RequestInterfaces'
import { ActivityType } from '..'
import { Util } from '../../utils/Util'
import { ReportUseCase } from '../../../application/usecases'


@Route('report')
export class ReportController extends Controller {
  private reportResource: string = "report";
  private reportRepository: ReportRepository;

  constructor() {
    super();
    this.reportRepository = new ReportRepository(new ReportMongoConnection())
   
  }
  //@Security("jwt")
  @Post("create")
  async create(@Body() data: ICreateReportRequest, @Request() request: any) {
    //let _user: any = await new Util().getUserInfo(request.user);
    // // TODO handle permission not found
    // let user_shine_name = _user.shineName;
    // let user_public_key = _user.shineKey;
    // //let refiner = _user._id;
    // let organization_id = _user.departmentId.organization_id;

    // let _department: any = await new Util().getDepartmentInfo(request.user);

    // let action: string = ActivityType.CREATE;
    // let isOwnerOrMember: boolean = true;
    // let resource: string = _department._id + ":" + this.reportResource;

    // let hasPermission: boolean = await new Util().hasPermission(request.user, isOwnerOrMember, action, _department.roles, resource);

    // if (hasPermission != true) {
    //   this.setStatus(400);
    //   return new Response().sendResponseFailure("User Not Authorized", false);
    // }
    const report_useCase = new ReportUseCase(this.reportRepository);
    let report_res:any = await new Report().create({...data}, report_useCase);
    if (report_res) {
      // let res_body = new CreateReportResponse();
      // res_body.uuid = report_res.uuid;
      return new Response().sendResponseSuccess(report_res.project_id, true);
    } else {
      return new Response().sendResponseFailure("something went wrong ", false);
    }
  }

    //@Security("jwt")
    @Post("update")
    async update(@Body() data: ICreateReportRequest, @Request() request: any) {
      //let _user: any = await new Util().getUserInfo(request.user);
      // // TODO handle permission not found
      // let user_shine_name = _user.shineName;
      // let user_public_key = _user.shineKey;
      // //let refiner = _user._id;
      // let organization_id = _user.departmentId.organization_id;
  
      // let _department: any = await new Util().getDepartmentInfo(request.user);
  
      // let action: string = ActivityType.CREATE;
      // let isOwnerOrMember: boolean = true;
      // let resource: string = _department._id + ":" + this.reportResource;
  
      // let hasPermission: boolean = await new Util().hasPermission(request.user, isOwnerOrMember, action, _department.roles, resource);
  
      // if (hasPermission != true) {
      //   this.setStatus(400);
      //   return new Response().sendResponseFailure("User Not Authorized", false);
      // }
      const report_useCase = new ReportUseCase(this.reportRepository);
      let report_res:any = await new Report().update({...data}, report_useCase);
      if (report_res) {
        // let res_body = new CreateReportResponse();
        // res_body.uuid = report_res.uuid;
        return new Response().sendResponseSuccess(report_res.project_id, true);
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
  @Get("getReportById")
  @Security("jwt")
  async getReportById(@Request() request: any,@Query() id: string) {
    try {
      // let _user: any = await new Util().getUserInfo(request.user);
      // // TODO handle permission not found
      // let user_shine_name = _user.shineName;
      // let user_public_key = _user.shineKey;
      // let organization_id = _user.departmentId.organization_id;
      // let _department: any = await new Util().getDepartmentInfo(request.user);
      // let action: string = ActivityType.READ;
      // let isOwnerOrMember: boolean = true;
      // let resource: string = _department._id + ":" + this.reportResource;
      // // console.log('resource', resource)
      // let hasPermission: boolean = await new Util().hasPermission(request.user, isOwnerOrMember, action, _department.roles, resource);
      // if (hasPermission != true) {
      //   this.setStatus(400);
      //   return new Response().sendResponseFailure("User Not Authorized", false);
      // }

      const report_useCase = new ReportUseCase(this.reportRepository);
      let result = await report_useCase.getReportById(id)
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure('something went wrong'+ Error, false);
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
  @Get("getAllReports")
  //@Security("jwt")
  async getAllReports(@Request() request: any,@Query() user_id?:string) {
    try {
      // //console.log('sourcing', sourcing)
      // let _user: any = await new Util().getUserInfo(request.user);
      // // TODO handle permission not found
      // let _department: any = await new Util().getDepartmentInfo(request.user);
      // let action: string = ActivityType.READ;
      // let isOwnerOrMember: boolean = true;
      // let resource: string = _department._id + ":" + this.reportResource;
      // console.log('resource', resource)
      // let hasPermission: boolean = await new Util().hasPermission(request.user, isOwnerOrMember, action, _department.roles, resource);
      // if (hasPermission != true) {
      //   this.setStatus(400);
      //   return new Response().sendResponseFailure("User Not Authorized", false);
      // }
      let filter:any={}
      if(user_id){
        filter["user_id"]=user_id
      }
      const report_useCase = new ReportUseCase(this.reportRepository);
      let result = await report_useCase.getAllReports(filter)
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong", false);
    }
  }
}
