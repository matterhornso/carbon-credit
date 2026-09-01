import { CreateAuditEvent } from "../../../domain";
import { IAuditEventRepository } from "../../repositories/IAuditEventRepository";

export default class AuditEvent {
  private auditEventRepository: IAuditEventRepository;
  constructor(auditEventRepository: IAuditEventRepository) {
    this.auditEventRepository = auditEventRepository;
  }

  createAuditEvent(event: CreateAuditEvent) {
    return this.auditEventRepository.createAuditEvent(event);
  }

  getEventsByProjectId(projectId: string) {
    return this.auditEventRepository.getEventsByProjectId(projectId);
  }
}
