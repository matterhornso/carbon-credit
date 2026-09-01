import { CreateMethodology } from "../../domain";
import { IMethodologyInterface } from "../../domain/methodology/methodologyInterface";

export abstract class IMethodologyRepository {
  abstract createMethodology(methodology: CreateMethodology): Promise<IMethodologyInterface>
  abstract getAllMethodologies(filter?: any): Promise<IMethodologyInterface[]>
  abstract getMethodologyById(id: string): Promise<IMethodologyInterface | null>
  abstract getMethodologyByCode(code: string): Promise<IMethodologyInterface | null>
}
