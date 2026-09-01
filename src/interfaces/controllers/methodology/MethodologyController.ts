import { Response } from '../../response/Response'
import { Controller, Get, Route, Query, Request, Security } from "tsoa"
import { MethodologyRepository } from '../../database/MethodologyRepository'
import { MethodologyMongoConnection } from '../../../infrastructure/database/helper/database/Methodology'
import { MethodologyUseCase } from '../../../application/usecases/index'

// Read-only in Phase 1: methodologies are admin-seeded via
// src/infrastructure/database/seed/methodology.seed.ts, not authored through
// the API. Reference/lookup data, not a department-owned resource, so plain
// JWT auth is sufficient — no RBAC permission check against a resource.
@Route('methodology')
export class MethodologyController extends Controller {
  private methodologyRepository: MethodologyRepository;
  constructor() {
    super();
    this.methodologyRepository = new MethodologyRepository(new MethodologyMongoConnection())
  }

  @Get("list")
  @Security("jwt")
  async list(@Request() request: any, @Query() sector?: string): Promise<any> {
    try {
      const methodology_useCase = new MethodologyUseCase(this.methodologyRepository);
      let result = await methodology_useCase.getAllMethodologies({ sector });
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }

  @Get("getByCode")
  @Security("jwt")
  async getByCode(@Request() request: any, @Query() code: string): Promise<any> {
    try {
      const methodology_useCase = new MethodologyUseCase(this.methodologyRepository);
      let result = await methodology_useCase.getMethodologyByCode(code);
      if (!result) {
        this.setStatus(404);
        return new Response().sendResponseFailure("Methodology not found", false);
      }
      return new Response().sendResponseSuccess(result, true);
    } catch (Error) {
      this.setStatus(500);
      return new Response().sendResponseFailure("Something went wrong " + Error, false);
    }
  }
}
