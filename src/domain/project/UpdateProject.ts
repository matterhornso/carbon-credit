import { IProjectInterface, IProjectLocation, IProjectCreditingPeriod } from './projectInterface';

// Covers the fields a caller may change directly. `status` is deliberately
// excluded — status changes always go through the lifecycle transition
// guard (assertValidTransition), never a raw field update, since they carry
// preconditions a generic update would bypass.
export class UpdateProject {
  id!: string;
  methodologyId?: string;
  location?: IProjectLocation;
  scale?: string;
  startDate?: Date;
  creditingPeriod?: IProjectCreditingPeriod;
  intake?: Record<string, any>;

  constructor(data: { id: string } & IProjectInterface) {
    if (!data.id) throw new Error('id missing!');
    this.id = data.id;
    this.methodologyId = data.methodologyId;
    this.location = data.location;
    this.scale = data.scale;
    this.startDate = data.startDate;
    this.creditingPeriod = data.creditingPeriod;
    this.intake = data.intake;
  }
}
