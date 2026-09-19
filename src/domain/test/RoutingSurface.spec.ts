import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';

/**
 * The audit that produced this file found nine endpoints that reached tenant
 * data without a tenant scope, three of them with no authentication at all
 * (report/create, report/update, report/getAllReports). None of them were bugs
 * in the code that was written — they were endpoints nobody looked at when
 * tenancy went in. Tenancy was applied to the path being worked on (origination)
 * and stopped at the controllers that were not.
 *
 * So the fix is not "scope those nine". The fix is that the served surface is
 * an asserted fact rather than whatever the controller directory happens to
 * contain. These tests read the GENERATED routes file — the thing express
 * actually mounts — not the decorators, which is where the previous mistake
 * hid: ReportController's @Security lines were commented out, so the source
 * looked deliberate while the generated route had no middleware at all.
 */

const ROUTES_FILE = path.join(__dirname, '../../infrastructure/routes/routes.ts');

// Every route that carbon-credit is allowed to serve. Adding an endpoint means
// adding it here, deliberately, in the same change — which is the point.
const EXPECTED_ROUTES = [
  'post /api/v1/attachment/upload',
  'get /api/v1/attachment/listByProject',
  'post /api/v1/generation/generateSection',
  'post /api/v1/generation/generateAll',
  'post /api/v1/generation/refineSection',
  'post /api/v1/generation/updateSection',
  'get /api/v1/generation/getJob',
  'post /api/v1/generation/generateCoverNote',
  'get /api/v1/generation/getCaseDocument',
  'get /api/v1/methodology/list',
  'get /api/v1/methodology/getByCode',
  'post /api/v1/project/create',
  'post /api/v1/project/selectMethodology',
  'post /api/v1/project/submitIntake',
  'get /api/v1/project/evidenceGaps',
  'get /api/v1/project/checkApplicability',
  'post /api/v1/project/transition',
  'get /api/v1/project/getProjectById',
  'get /api/v1/project/getAllProjects',
];

// Routes that may legitimately be served without authentication. Empty, and a
// test asserts it stays that way: carbon-credit has no public surface. Health
// probes (/healthz, /livez, /readyz) are mounted in router.ts, not by tsoa, so
// they are deliberately outside this list.
const PUBLIC_ROUTES: string[] = [];

interface MountedRoute {
  method: string;
  route: string;
  authenticated: boolean;
}

function parseMountedRoutes(source: string): MountedRoute[] {
  const mounted: MountedRoute[] = [];
  const lines = source.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/app\.(get|post|put|patch|delete)\('([^']+)'/);
    if (!match) return;

    // tsoa emits the middleware on the lines immediately following the mount.
    // Look ahead to the start of the handler body rather than a fixed offset,
    // because the gap differs between authenticated and unauthenticated routes
    // — which is exactly the difference this test exists to notice.
    const lookahead = lines.slice(index + 1, index + 5).join('\n');
    mounted.push({
      method: match[1],
      route: match[2],
      authenticated: lookahead.includes('authenticateMiddleware'),
    });
  });

  return mounted;
}

describe('Test the served routing surface', () => {

  let mounted: MountedRoute[];

  before(() => {
    expect(fs.existsSync(ROUTES_FILE), `generated routes missing at ${ROUTES_FILE} — run: npx tsoa routes`).to.equal(true);
    mounted = parseMountedRoutes(fs.readFileSync(ROUTES_FILE, 'utf8'));
  });

  it('parses a non-trivial number of routes (guards the parser itself)', () => {
    // A regex that silently matches nothing would make every other test in this
    // file pass vacuously. This is the guard against a green suite that checked
    // nothing at all.
    expect(mounted.length).to.be.greaterThan(10);
  });

  // The headline property. Not "these nine are scoped" but "nothing is served
  // unauthenticated", which stays true for endpoints that do not exist yet.
  it('serves no endpoint without authentication', () => {
    const unauthenticated = mounted
      .filter(r => !r.authenticated)
      .filter(r => !PUBLIC_ROUTES.includes(`${r.method} ${r.route}`))
      .map(r => `${r.method.toUpperCase()} ${r.route}`);

    expect(unauthenticated, `unauthenticated endpoints are being served: ${unauthenticated.join(', ')}`).to.deep.equal([]);
  });

  it('serves exactly the expected set of routes, and no others', () => {
    const actual = mounted.map(r => `${r.method} ${r.route}`).sort();
    const expected = [...EXPECTED_ROUTES].sort();

    const added = actual.filter(r => !expected.includes(r));
    const removed = expected.filter(r => !actual.includes(r));

    // Named separately so the failure says which direction drifted. An added
    // route is a new endpoint nobody reviewed; a removed one is a regression in
    // the tsoa allowlist (a controller silently dropped out of generation).
    expect(added, `endpoints served but not declared in EXPECTED_ROUTES: ${added.join(', ')}`).to.deep.equal([]);
    expect(removed, `endpoints declared but not served — check controllerPathGlobs in tsoa.json: ${removed.join(', ')}`).to.deep.equal([]);
  });

  // The specific holes the audit found, pinned by name so nobody reintroduces
  // them by "fixing" the tsoa allowlist back to a wildcard.
  //
  // Both verticals are now deleted outright, but the guard stays: it is cheap,
  // and the history is worth keeping because the tracing went wrong twice.
  //
  // The original audit called all nine endpoints dead. It traced consumers of
  // Endpoints.ts and missed the API-wrapper layer above it, where the real
  // callers lived - two of them, each found only after assuming there were
  // none:
  //
  //   dataCollectionCalls -> useProject.moveToNextSection -> IssuanceDataCollection
  //   dataCollectionCalls -> useReport.moveToNextSection  -> MonthlyReportUpdate
  //
  // Both features were retired deliberately (2026-09-19) rather than having
  // their endpoints deleted from under them, which is what made the deletion
  // safe. report/* was the one part of the original claim that did hold: no
  // caller anywhere, and three of its four endpoints served with no
  // authentication middleware at all.
  //
  // The lesson this file exists to carry: grep finds imports, not consumption.
  // It missed an API wrapper here, and separately it called five redux slices
  // orphaned when a live hook was reading them by destructuring the store. The
  // compiler caught that one. Prefer a check the type system can make.
  it('does not serve the retired legacy endpoints', () => {
    const retired = mounted
      .map(r => r.route)
      .filter(route => /projectSection[A-E]|\/report\//.test(route));

    expect(retired, `retired legacy endpoints are being served again: ${retired.join(', ')}`).to.deep.equal([]);
  });

  it('keeps carbon-credit free of any public surface', () => {
    // If this ever needs to change, it should be an argued change with a named
    // endpoint — not a quiet addition alongside a feature.
    expect(PUBLIC_ROUTES).to.deep.equal([]);
  });
});

/**
 * The second half of the same class of bug: a route can be authenticated and
 * still read across tenants. Authentication says who you are; the tenant scope
 * says whose rows you may see. ProjectSectionA-E were authenticated and still
 * unscoped, which is why the auth check above is necessary but not sufficient.
 */
describe('Test tenant scoping at the controller boundary', () => {

  // Repositories that hold per-tenant rows. Constructing one of these without a
  // TenantScope is a compile error by design (the constructor requires it), so
  // this test is about controllers reaching for the raw connection instead.
  const TENANT_SCOPED_REPOSITORIES = [
    'ProjectRepository',
    'CaseDocumentRepository',
    'SourceDocumentRepository',
    'AuditEventRepository',
  ];

  function controllerAllowlist(): string[] {
    const tsoaConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../tsoa.json'), 'utf8'));
    return tsoaConfig.controllerPathGlobs as string[];
  }

  function routedControllerFiles(): string[] {
    // Read the same allowlist express is built from, so this test covers
    // exactly what is served — not files that happen to sit in the directory.
    return controllerAllowlist()
      .map(entry => path.join(__dirname, '../../../', entry))
      .filter(file => fs.existsSync(file));
  }

  // Without this, a wildcard entry would make the scoping test below cover
  // fewer files while still passing — the glob resolves to no real path and is
  // silently filtered out. A test that quietly checks less is how the original
  // hole survived review in the first place, so fail loudly instead.
  it('has no wildcard in the controller allowlist', () => {
    const globbed = controllerAllowlist().filter(entry => /[*?[\]]/.test(entry));
    expect(globbed, `tsoa.json controllerPathGlobs must list controllers explicitly, found wildcard(s): ${globbed.join(', ')}`).to.deep.equal([]);
  });

  it('resolves every allowlist entry to a file that exists', () => {
    const missing = controllerAllowlist().filter(entry => !fs.existsSync(path.join(__dirname, '../../../', entry)));
    expect(missing, `tsoa.json lists controllers that do not exist: ${missing.join(', ')}`).to.deep.equal([]);
  });

  it('reads its controller list from the same allowlist tsoa uses', () => {
    const files = routedControllerFiles();
    expect(files.length, 'no routed controllers resolved — the tsoa allowlist and this test have drifted apart').to.be.greaterThan(0);
  });

  it('builds every tenant-scoped repository through a TenantScope', () => {
    const offenders: string[] = [];

    routedControllerFiles().forEach(file => {
      const source = fs.readFileSync(file, 'utf8');

      TENANT_SCOPED_REPOSITORIES.forEach(repository => {
        // Match construction sites and check a scope is passed. The shape being
        // looked for is `new XRepository(new XMongoConnection(), scope)`, so the
        // argument list contains one level of nested parens — a naive `[^)]*`
        // stops at the inner connection and never sees the scope argument.
        const constructions = source.match(new RegExp(`new ${repository}\\((?:[^()]|\\([^()]*\\))*\\)`, 'g')) || [];

        constructions.forEach(construction => {
          const passesScope = /,\s*(scope|this\.scope|tenantScope)/.test(construction);
          if (!passesScope) {
            offenders.push(`${path.basename(file)}: ${construction.replace(/\s+/g, ' ')}`);
          }
        });
      });
    });

    expect(offenders, `tenant-scoped repositories built without a TenantScope:\n  ${offenders.join('\n  ')}`).to.deep.equal([]);
  });
});
