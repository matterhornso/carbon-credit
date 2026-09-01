import { CreateMethodology } from "../../../domain";
import { IMethodologyRepository } from "../../repositories/IMethodologyRepository";

export default class Methodology {
  private methodologyRepository: IMethodologyRepository;
  constructor(methodologyRepository: IMethodologyRepository) {
    this.methodologyRepository = methodologyRepository;
  }

  createMethodology(methodology: CreateMethodology) {
    return this.methodologyRepository.createMethodology(methodology);
  }

  getAllMethodologies(filter?: any) {
    return this.methodologyRepository.getAllMethodologies(filter);
  }

  getMethodologyById(id: string) {
    return this.methodologyRepository.getMethodologyById(id);
  }

  getMethodologyByCode(code: string) {
    return this.methodologyRepository.getMethodologyByCode(code);
  }
}
