import { expect } from 'chai';
import { resolveSections, resolveSectionKeys } from '../../application/usecases/registry/RegistryTemplate';
import { registryForMethodology } from '../../application/usecases/registry/RegistryCatalog';
import { VM0047_CENSUS_BASED, VMR0017_GRID_RENEWABLE } from '../../infrastructure/database/seed/methodology.seed';
import { GS_METERED_COOKING } from '../../infrastructure/database/seed/methodology.gs.seed';
import { evaluateApplicability } from '../../application/usecases/project_lifecycle/ApplicabilityEvaluator';

/**
 * The end-to-end version of the cross-registry claim. RegistryTemplate.spec
 * proves the resolver merges correctly given a registry and a methodology;
 * this proves the whole seeded catalogue actually spans registries, and that
 * the engine handles the third structural shape with no code written for it.
 *
 * Three methodologies, two registries, three sectors, and — the part that
 * matters — one code path. If any of these needed a branch, the claim is false
 * however well the resolver unit-tests.
 */

const ALL = [VM0047_CENSUS_BASED, VMR0017_GRID_RENEWABLE, GS_METERED_COOKING];

describe('Test cross-registry origination', () => {

  describe('the catalogue spans registries', () => {

    it('routes each methodology to its own registry from its own declaration', () => {
      expect(registryForMethodology(VM0047_CENSUS_BASED)!.code).to.equal('VCS');
      expect(registryForMethodology(VMR0017_GRID_RENEWABLE)!.code).to.equal('VCS');
      expect(registryForMethodology(GS_METERED_COOKING)!.code).to.equal('GS');
    });

    it('gives the Gold Standard methodology a Gold Standard document', () => {
      const keys = resolveSectionKeys(registryForMethodology(GS_METERED_COOKING), GS_METERED_COOKING);

      expect(keys).to.include('sdg_contributions');
      expect(keys).to.include('stakeholder_consultation');
      expect(keys).to.include('safeguarding_principles');
      // VCS-only sections must not appear on a GS submission.
      expect(keys).to.not.include('project_boundary');
      expect(keys).to.not.include('data_quality_management');
    });

    it('names the document what the registry names it', () => {
      // Small, but it is the cheapest signal to a customer that the platform
      // knows their registry rather than treating every registry as Verra.
      expect(registryForMethodology(GS_METERED_COOKING)!.documentTemplate!.documentName).to.contain('GS4GG');
      expect(registryForMethodology(VM0047_CENSUS_BASED)!.documentTemplate!.documentName).to.contain('VCS');
    });
  });

  describe('the methodology supplies science, the registry supplies the document', () => {

    it('generates the GS-mandated sections the methodology says nothing about', () => {
      // GS-MMECD declares no overlay for SDG contributions or stakeholder
      // consultation. Gold Standard requires both. They must still generate, or
      // the customer receives a document that fails validation at the VVB
      // rather than here.
      const resolved = resolveSections(registryForMethodology(GS_METERED_COOKING), GS_METERED_COOKING);

      ['sdg_contributions', 'stakeholder_consultation', 'safeguarding_principles'].forEach((key) => {
        const section = resolved.find((s) => s.key === key)!;
        expect(section, `${key} missing`).to.not.equal(undefined);
        expect(section.origin).to.equal('registry');
        expect(section.promptFragment.length).to.be.greaterThan(40);
      });
    });

    it('carries the methodology voice into the sections it does speak to', () => {
      const resolved = resolveSections(registryForMethodology(GS_METERED_COOKING), GS_METERED_COOKING);
      const baseline = resolved.find((s) => s.key === 'baseline_scenario')!;

      expect(baseline.origin).to.equal('registry+methodology');
      // The methodology's specific instruction survives the merge. This is the
      // rigour that makes output defensible; losing it would leave a correctly
      // shaped document that says nothing specific.
      expect(baseline.promptFragment).to.contain('fNRB');
    });
  });

  describe('one code path, three shapes', () => {

    it('resolves a non-empty ordered document for every seeded methodology', () => {
      ALL.forEach((methodology) => {
        const resolved = resolveSections(registryForMethodology(methodology), methodology);

        expect(resolved.length, `${methodology.code} resolved to no sections`).to.be.greaterThan(0);
        const orders = resolved.map((s) => s.order);
        expect(orders, `${methodology.code} sections out of order`).to.deep.equal([...orders].sort((a, b) => a - b));
      });
    });

    it('renders every required input of every methodology through the generic form', () => {
      // The genericity claim at the intake layer, extended to the third shape.
      // A dataType the form cannot render is a field a user can never satisfy —
      // the exact defect found in VM0047's options-less multiselect.
      const renderable = ['string', 'number', 'date', 'boolean', 'select', 'multiselect', 'file'];

      ALL.forEach((methodology) => {
        (methodology.requiredInputs || []).forEach((input) => {
          expect(renderable, `${methodology.code}/${input.key} has unrenderable dataType '${input.dataType}'`).to.include(input.dataType);
          // A select with no options is always a seed bug: there is nothing to
          // pick and nothing to type. A multiselect may legitimately be open.
          if (input.dataType === 'select') {
            expect(input.options, `${methodology.code}/${input.key} is a select with no options`).to.not.equal(undefined);
            expect(input.options!.length).to.be.greaterThan(0);
          }
        });
      });
    });

    it('evaluates applicability for the third shape with no code written for it', () => {
      const intake = {
        meteringInPlace: true,
        baselineFuel: 'charcoal',
        stakeholderConsultationHeld: true,
      };
      const result = evaluateApplicability(GS_METERED_COOKING.applicabilityConditions!, intake);

      const byKey = new Map(result.results.map((c: any) => [c.key, c.result]));
      expect(byKey.get('device_metering')).to.equal('pass');
      expect(byKey.get('displaces_nonrenewable')).to.equal('pass');
      expect(byKey.get('stakeholder_consultation_done')).to.equal('pass');
      // The two judgement conditions route to review rather than silently
      // passing — fNRB in particular decides the entire result.
      expect(byKey.get('fnrb_source')).to.equal('needs_review');
      expect(byKey.get('no_double_counting')).to.equal('needs_review');
    });

    it('fails an unmetered project rather than waving it through', () => {
      // Guards against a vacuously permissive evaluator: the condition that
      // defines this methodology must actually be able to fail.
      const result = evaluateApplicability(GS_METERED_COOKING.applicabilityConditions!, {
        meteringInPlace: false,
        baselineFuel: 'charcoal',
        stakeholderConsultationHeld: true,
      });

      const metering = result.results.find((c: any) => c.key === 'device_metering');
      expect(metering!.result).to.equal('fail');
      expect(result.eligible).to.equal(false);
    });
  });

  describe('honesty about seed provenance', () => {

    it('keeps the un-verified methodology out of the active catalogue', () => {
      // This seed was drafted from domain knowledge rather than transcribed
      // from the published methodology. Its structure is what the registry
      // layer is tested against; its thresholds are not primary-verified. It
      // must not present itself to a customer as ready to originate on.
      expect(GS_METERED_COOKING.status).to.equal('draft');
      expect(GS_METERED_COOKING.sourceReference!.name).to.contain('NOT primary-verified');
    });

    it('keeps the primary-verified methodologies active', () => {
      expect(VM0047_CENSUS_BASED.status).to.equal('active');
      expect(VMR0017_GRID_RENEWABLE.status).to.equal('active');
    });
  });
});
