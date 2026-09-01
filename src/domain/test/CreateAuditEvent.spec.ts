import { expect } from 'chai';
import { CreateAuditEvent } from '../audit_event/CreateAuditEvent';

describe('Test class CreateAuditEvent', () => {

  const validEvent: any = {
    projectId: 'project-1',
    actorUserId: 'user-1',
    actorRole: 'ISSUER',
    eventType: 'PROJECT_CREATED',
    after: { status: 'DRAFT_INTAKE' },
  };

  it('sets the supplied fields', () => {
    const createAuditEvent = new CreateAuditEvent(validEvent);
    expect(createAuditEvent.eventType).equals('PROJECT_CREATED');
    expect(createAuditEvent.after).to.deep.equal({ status: 'DRAFT_INTAKE' });
  });

  it('throws when eventType is missing', () => {
    const { eventType, ...rest } = validEvent;
    expect(() => new CreateAuditEvent(rest)).to.throw('eventType missing!');
  });

  it('throws when actorUserId is missing', () => {
    const { actorUserId, ...rest } = validEvent;
    expect(() => new CreateAuditEvent(rest)).to.throw('actorUserId missing!');
  });

});
