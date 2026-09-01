import { IMethodologyRepository } from '../../application/repositories/IMethodologyRepository'
import { CreateMethodology } from '../../domain'
import { MethodologyConnection } from './IDBConnection'
import { IMethodologyInterface } from "../../domain/methodology/methodologyInterface";

export class MethodologyRepository extends IMethodologyRepository {
  private connection: MethodologyConnection

  constructor(connection: MethodologyConnection) {
    super()
    this.connection = connection
  }

  async createMethodology(methodology: CreateMethodology): Promise<IMethodologyInterface> {
    let queryResults = await this.connection.createMethodology(methodology);
    return queryResults;
  }

  async getAllMethodologies(filter?: any): Promise<IMethodologyInterface[]> {
    let queryResults = await this.connection.getAllMethodologies(filter);
    return queryResults;
  }

  async getMethodologyById(id: string): Promise<IMethodologyInterface | null> {
    let queryResults = await this.connection.getMethodologyById(id);
    return queryResults;
  }

  async getMethodologyByCode(code: string): Promise<IMethodologyInterface | null> {
    let queryResults = await this.connection.getMethodologyByCode(code);
    return queryResults;
  }
}
