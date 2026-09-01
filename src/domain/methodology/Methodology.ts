import { IMethodologyInterface } from './methodologyInterface';
import { CreateMethodology } from './CreateMethodology';
import { MethodologyUseCase } from '../../application/usecases/index';

export class Methodology {
  create(methodology: IMethodologyInterface, useCase: MethodologyUseCase) {
    let createMethodology = new CreateMethodology(methodology);
    return useCase.createMethodology(createMethodology);
  }
}
