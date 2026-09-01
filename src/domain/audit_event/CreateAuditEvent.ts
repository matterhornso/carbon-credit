import { IAuditEventInterface } from './auditEventInterface';

export class CreateAuditEvent implements IAuditEventInterface {
  projectId!: string;
  actorUserId!: string;
  actorRole!: string;
  eventType!: string;
  before?: any;
  after?: any;

  constructor(event: IAuditEventInterface) {
    if (!event.projectId) throw new Error('projectId missing!');
    if (!event.actorUserId) throw new Error('actorUserId missing!');
    if (!event.actorRole) throw new Error('actorRole missing!');
    if (!event.eventType) throw new Error('eventType missing!');
    this.projectId = event.projectId as string;
    this.actorUserId = event.actorUserId;
    this.actorRole = event.actorRole;
    this.eventType = event.eventType;
    this.before = event.before;
    this.after = event.after;
  }
}
