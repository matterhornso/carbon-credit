import { expect } from 'chai';
import { TenantScope } from '../tenant/TenantScope';
import { ProjectRepository } from '../../interfaces/database/ProjectRepository';
import { CaseDocumentRepository } from '../../interfaces/database/CaseDocumentRepository';
import { SourceDocumentRepository } from '../../interfaces/database/SourceDocumentRepository';
import { AuditEventRepository } from '../../interfaces/database/AuditEventRepository';

describe('Test tenant isolation', () => {

  describe('TenantScope', () => {

    it('refuses to exist without a tenant', () => {
      expect(() => new TenantScope('')).to.throw(/requires a tenantId/);
      expect(() => new TenantScope('   ')).to.throw(/requires a tenantId/);
      expect(() => new TenantScope(undefined as any)).to.throw(/requires a tenantId/);
    });

    // The point of applying the tenant last: a filter arriving from a request
    // must not be able to widen the query to another operator's data.
    it('cannot be widened by a caller-supplied filter', () => {
      const scope = new TenantScope('tenant-a');
      const filter = scope.filter({ status: 'DRAFT_INTAKE', tenantId: 'tenant-b' });

      expect(filter.tenantId).equals('tenant-a');
      expect(filter.status).equals('DRAFT_INTAKE');
    });

    it('stamps the tenant onto documents being created', () => {
      const scope = new TenantScope('tenant-a');
      expect(scope.stamp({ name: 'Mangrove restoration' })).deep.equals({
        name: 'Mangrove restoration', tenantId: 'tenant-a',
      });
    });

    it('does not treat different tenants as equal', () => {
      expect(new TenantScope('a').equals(new TenantScope('a'))).equals(true);
      expect(new TenantScope('a').equals(new TenantScope('b'))).equals(false);
      expect(new TenantScope('a').equals(undefined)).equals(false);
    });

  });

  describe('repositories', () => {

    // Constructing these without a scope is a compile error; this covers the
    // runtime half, where a scope is built from a value that turned out empty.
    it('cannot be built from an empty tenant', () => {
      const connection: any = {};
      expect(() => new ProjectRepository(connection, new TenantScope(''))).to.throw();
      expect(() => new CaseDocumentRepository(connection, new TenantScope(''))).to.throw();
      expect(() => new SourceDocumentRepository(connection, new TenantScope(''))).to.throw();
      expect(() => new AuditEventRepository(connection, new TenantScope(''))).to.throw();
    });

    // Every repository call must reach the connection carrying the tenant, in
    // the first position. A method that forgot would silently read across
    // tenants, so this asserts the wiring rather than trusting it.
    it('passes the tenant into every project operation', async () => {
      const seen: Array<{ method: string; tenantId: any }> = [];
      const record = (method: string) => (tenantId: any, ..._rest: any[]) => {
        seen.push({ method, tenantId });
        return Promise.resolve(null);
      };
      const connection: any = {
        createProject: record('createProject'),
        updateProject: record('updateProject'),
        transitionStatus: record('transitionStatus'),
        setCaseDocumentId: record('setCaseDocumentId'),
        addAttachment: record('addAttachment'),
        getAllProjects: record('getAllProjects'),
        getProjectById: record('getProjectById'),
      };
      const repo = new ProjectRepository(connection, new TenantScope('tenant-a'));

      await repo.createProject({} as any);
      await repo.updateProject({} as any);
      await repo.transitionStatus('p1', 'CASE_GENERATING');
      await repo.setCaseDocumentId('p1', 'c1');
      await repo.addAttachment('p1', 's1');
      await repo.getAllProjects({ status: 'DRAFT_INTAKE' });
      await repo.getProjectById('p1');

      expect(seen).to.have.lengthOf(7);
      seen.forEach((call) => {
        expect(call.tenantId, `${call.method} did not pass the tenant first`).equals('tenant-a');
      });
    });

    it('passes the tenant into every case document and evidence operation', async () => {
      const seen: string[] = [];
      const record = (m: string) => (tenantId: any) => { seen.push(`${m}:${tenantId}`); return Promise.resolve(null); };

      const caseRepo = new CaseDocumentRepository({
        createCaseDocument: record('create'), updateSection: record('update'),
        getCaseDocumentByProjectId: record('get'),
      } as any, new TenantScope('tenant-a'));
      await caseRepo.createCaseDocument({} as any);
      await caseRepo.updateSection({} as any);
      await caseRepo.getCaseDocumentByProjectId('p1');

      const srcRepo = new SourceDocumentRepository({
        createSourceDocument: record('createDoc'), getSourceDocumentsByProjectId: record('getDocs'),
        updateExtractedText: record('updateText'),
      } as any, new TenantScope('tenant-a'));
      await srcRepo.createSourceDocument({} as any);
      await srcRepo.getSourceDocumentsByProjectId('p1');
      await srcRepo.updateExtractedText('d1', 'text', 'processed');

      const auditRepo = new AuditEventRepository({
        createAuditEvent: record('createEvent'), getEventsByProjectId: record('getEvents'),
      } as any, new TenantScope('tenant-a'));
      await auditRepo.createAuditEvent({} as any);
      await auditRepo.getEventsByProjectId('p1');

      expect(seen).to.have.lengthOf(8);
      seen.forEach((call) => expect(call, call).to.match(/:tenant-a$/));
    });

  });

});
