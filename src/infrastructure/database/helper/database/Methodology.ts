import { CreateMethodology } from "../../../../domain";
import { IMethodologyInterface } from "../../../../domain/methodology/methodologyInterface";
import { MethodologyConnection } from "../../../../interfaces/database/IDBConnection"
import { MethodologyModel } from "../../modal/methodology/methodology.model";

export class MethodologyMongoConnection extends MethodologyConnection {

  constructor() {
    super();
  }
  async createMethodology(methodology: CreateMethodology): Promise<IMethodologyInterface> {
    let methodology_res = await MethodologyModel.createMethodology(methodology);
    return methodology_res;
  }

  async getAllMethodologies(filter?: any): Promise<IMethodologyInterface[]> {
    let methodology_res = await MethodologyModel.getAllMethodologies(filter);
    return methodology_res;
  }

  async getMethodologyById(id: string): Promise<IMethodologyInterface | null> {
    let methodology_res = await MethodologyModel.getMethodologyById(id);
    return methodology_res;
  }

  async getMethodologyByCode(code: string): Promise<IMethodologyInterface | null> {
    let methodology_res = await MethodologyModel.getMethodologyByCode(code);
    return methodology_res;
  }
}
