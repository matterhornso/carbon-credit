import { IAuditEventInterface } from './auditEventInterface';
import { CreateAuditEvent } from './CreateAuditEvent';
import { AuditEventUseCase } from '../../application/usecases/index';

export class AuditEvent {
  record(event: IAuditEventInterface, useCase: AuditEventUseCase) {
    let createAuditEvent = new CreateAuditEvent(event);
    return useCase.createAuditEvent(createAuditEvent);
  }
}
