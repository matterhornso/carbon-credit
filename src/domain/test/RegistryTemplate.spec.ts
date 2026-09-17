import { expect } from 'chai';
import { resolveSections, resolveSectionKeys, resolveGuidance, readOverlays } from '../../application/usecases/registry/RegistryTemplate';
import { VCS, GOLD_STANDARD } from '../../infrastructure/database/seed/registry.seed';
import { VM0047_CENSUS_BASED, VMR0017_GRID_RENEWABLE } from '../../infrastructure/database/seed/methodology.seed';

/**
 * The claim under test is "originate any project type on any registry". Before
 * this split it was not merely unproven, it was structurally impossible: the
 * registry's document template lived inside each methodology, so two Verra
 * methodologies carried two copies of the same ten sections and a Gold Standard
 * methodology had nowhere to put a different nine.
 *
 * These tests do two jobs. First, prove the lift was faithful — resolving
 * VCS + VM0047 must reproduce exactly the section list VM0047 shipped with,
 * because a transcription error here silently changes what every Verra project
 * generates. Second, prove the split actually bought something — the same
 * methodology resolved against two registries must produce two different
 * documents, or the abstraction is decoration.
 */

// The real seeded documents, not fixtures: a fixture would drift from the seed
// and this test would then prove the lift was faithful to something nobody
// ships.
const VM0047 = VM0047_CENSUS_BASED;
const VMR0017 = VMR0017_GRID_RENEWABLE;

describe('Test registry template resolution', () => {

  describe('the VCS lift is faithful', () => {

    // The whole risk of this refactor in one test. The ten VCS sections were
    // transcribed out of the methodology seeds; if a key was mistyped, every
    // Verra project silently generates a document with a missing or misnamed
    // section, and nothing else in the suite would notice.
    it('resolves VM0047 to exactly the section keys it declared before', () => {
      const legacyKeys = (VM0047.sectionGuidance || []).map((g: any) => g.section).sort();
      const resolvedKeys = resolveSectionKeys(VCS, VM0047).sort();

      expect(resolvedKeys).to.deep.equal(legacyKeys);
    });

    it('resolves VMR0017 to exactly the section keys it declared before', () => {
      const legacyKeys = (VMR0017.sectionGuidance || []).map((g: any) => g.section).sort();
      const resolvedKeys = resolveSectionKeys(VCS, VMR0017).sort();

      expect(resolvedKeys).to.deep.equal(legacyKeys);
    });

    it('keeps every methodology prompt fragment intact in the merged guidance', () => {
      // The registry expectation is added to the methodology's fragment, never
      // substituted for it. Losing the fragment would strip out precisely the
      // methodology-specific rigour (VM0047's "do not invent a counterfactual",
      // for one) that makes the output survive a VVB.
      const resolved = resolveSections(VCS, VM0047);

      (VM0047.sectionGuidance || []).forEach((guidance: any) => {
        const section = resolved.find((s) => s.key === guidance.section);
        expect(section, `section ${guidance.section} vanished in resolution`).to.not.equal(undefined);
        expect(section!.promptFragment).to.include(guidance.promptFragment);
      });
    });

    it('labels the registry and methodology halves rather than running them together', () => {
      const resolved = resolveSections(VCS, VM0047);
      const additionality = resolved.find((s) => s.key === 'additionality')!;

      expect(additionality.promptFragment).to.include('REGISTRY EXPECTATION:');
      expect(additionality.promptFragment).to.include('METHODOLOGY GUIDANCE:');
    });

    it('marks sections that both the registry and the methodology speak to', () => {
      const resolved = resolveSections(VCS, VM0047);
      expect(resolved.every((s) => s.origin === 'registry+methodology')).to.equal(true);
    });
  });

  describe('the split actually buys cross-registry support', () => {

    it('produces a different document for the same methodology on a different registry', () => {
      // If these were equal the abstraction would be decoration.
      const onVerra = resolveSectionKeys(VCS, VM0047);
      const onGoldStandard = resolveSectionKeys(GOLD_STANDARD, VM0047);

      expect(onGoldStandard).to.not.deep.equal(onVerra);
    });

    it('carries the Gold Standard sections that have no VCS equivalent', () => {
      const keys = resolveSectionKeys(GOLD_STANDARD, VM0047);

      expect(keys).to.include('sdg_contributions');
      expect(keys).to.include('stakeholder_consultation');
      expect(keys).to.include('safeguarding_principles');
    });

    it('drops the VCS-only sections when the registry does not ask for them', () => {
      const keys = resolveSectionKeys(GOLD_STANDARD, VM0047);

      // VCS asks for these; the GS template does not. A document carrying
      // sections its registry never requested is as wrong as one missing them.
      expect(keys).to.not.include('project_boundary');
      expect(keys).to.not.include('data_quality_management');
    });

    it('generates a registry-required section even when the methodology is silent on it', () => {
      // VM0047 has nothing to say about SDG contributions — it is a Verra
      // methodology. Gold Standard requires the section anyway. Omitting it
      // would hand the customer a document that fails validation at the VVB
      // rather than here.
      const resolved = resolveSections(GOLD_STANDARD, VM0047);
      const sdg = resolved.find((s) => s.key === 'sdg_contributions')!;

      expect(sdg.origin).to.equal('registry');
      expect(sdg.promptFragment).to.include('REGISTRY EXPECTATION:');
      expect(sdg.promptFragment).to.not.include('METHODOLOGY GUIDANCE:');
    });

    it('orders sections the way the registry orders them, not the methodology', () => {
      const resolved = resolveSections(GOLD_STANDARD, VM0047);
      const orders = resolved.map((s) => s.order);

      expect(orders).to.deep.equal([...orders].sort((a, b) => a - b));
      // GS puts safeguarding second; VCS puts it ninth. The reviewer reads in
      // the registry's order.
      expect(resolved[1].key).to.equal('safeguarding_principles');
    });
  });

  describe('migration safety', () => {

    it('falls back to the methodology section list when no registry is supplied', () => {
      // A methodology whose registry row is missing must degrade to the old
      // behaviour — "works, less structured" — not to an empty document, which
      // would be a silent data-loss failure rather than a visible one.
      const keys = resolveSectionKeys(undefined, VM0047);
      const legacyKeys = (VM0047.sectionGuidance || []).map((g: any) => g.section);

      expect(keys).to.deep.equal(legacyKeys);
    });

    it('reads the legacy sectionGuidance field as overlays', () => {
      const overlays = readOverlays(VM0047);

      expect(overlays.length).to.equal((VM0047.sectionGuidance || []).length);
      expect(overlays[0]).to.have.property('promptFragment');
    });

    it('still yields the shape GenerationService consumes', () => {
      const guidance = resolveGuidance(VCS, VM0047);

      expect(guidance.length).to.be.greaterThan(0);
      guidance.forEach((g) => {
        expect(g).to.have.property('section');
        expect(g).to.have.property('contentType');
        expect(g).to.have.property('promptFragment');
        expect(['structured', 'narrative']).to.include(g.contentType);
      });
    });

    it('lets a methodology override the registry default content type', () => {
      const methodology: any = {
        code: 'TEST', sectionGuidance: [
          { section: 'project_description', contentType: 'structured', promptFragment: 'x' },
        ],
      };
      const resolved = resolveSections(VCS, methodology);
      const section = resolved.find((s) => s.key === 'project_description')!;

      // VCS defaults project_description to narrative; the methodology wins.
      expect(section.contentType).to.equal('structured');
    });

    it('appends a methodology section the registry template does not name', () => {
      const methodology: any = {
        code: 'TEST', additionalSections: [
          { section: 'leakage_assessment', contentType: 'structured', promptFragment: 'assess leakage' },
        ],
      };
      const resolved = resolveSections(VCS, methodology);
      const extra = resolved.find((s) => s.key === 'leakage_assessment')!;

      expect(extra).to.not.equal(undefined);
      expect(extra.origin).to.equal('methodology');
      // After every registry section, because the registry's order is the
      // order the document is read in.
      expect(extra.order).to.be.greaterThan(Math.max(...(VCS.documentTemplate!.sections.map(s => s.order))) - 1);
    });
  });

  describe('the registry templates themselves', () => {

    it('gives every registry section a unique key', () => {
      [VCS, GOLD_STANDARD].forEach((registry) => {
        const keys = registry.documentTemplate!.sections.map((s) => s.key);
        expect(new Set(keys).size, `${registry.code} has duplicate section keys`).to.equal(keys.length);
      });
    });

    it('gives every registry section a unique order', () => {
      [VCS, GOLD_STANDARD].forEach((registry) => {
        const orders = registry.documentTemplate!.sections.map((s) => s.order);
        expect(new Set(orders).size, `${registry.code} has duplicate section orders`).to.equal(orders.length);
      });
    });

    it('gives every section a valid content type and real registry guidance', () => {
      [VCS, GOLD_STANDARD].forEach((registry) => {
        registry.documentTemplate!.sections.forEach((section) => {
          expect(['structured', 'narrative'], `${registry.code}/${section.key}`).to.include(section.contentType);
          // Guards a placeholder shipping as a template: a section whose
          // guidance is a stub produces a section whose content is a stub.
          expect(section.registryGuidance.length, `${registry.code}/${section.key} guidance too short`).to.be.greaterThan(40);
        });
      });
    });

    it('keeps the two registries genuinely different (guards a copy-paste seed)', () => {
      const vcsKeys = VCS.documentTemplate!.sections.map((s) => s.key);
      const gsKeys = GOLD_STANDARD.documentTemplate!.sections.map((s) => s.key);

      expect(gsKeys).to.not.deep.equal(vcsKeys);
      expect(GOLD_STANDARD.rules!.maxCreditingPeriodYears).to.not.equal(VCS.rules!.maxCreditingPeriodYears);
    });
  });
});
