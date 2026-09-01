// Pins the architecture's central claim: the same applicability engine and the
// same intake/section contracts serve structurally different methodologies with
// NO methodology-specific code — only seed data differs.
//
// This was proven once by hand (a full live run for VM0047 then VMR0017; see
// AGENT_BUILD_LOG.md checkpoints 3 and 4). These tests exist so a regression
// that quietly re-couples the engine to AFOLU fails CI instead of being
// discovered during the next cross-sector run.
//
// It deliberately imports the REAL seeded methodology documents rather than
// fixtures — a fixture could drift from what actually ships. (The seed module
// only opens a Mongo connection under `require.main === module`, so importing
// it here is side-effect-free.)

import { expect } from 'chai';
import { evaluateApplicability } from '../../application/usecases/project_lifecycle/ApplicabilityEvaluator';
import {
  VM0047_CENSUS_BASED,
  VMR0017_GRID_RENEWABLE,
} from '../../infrastructure/database/seed/methodology.seed';

// Intake that should satisfy each methodology — mirrors what was actually
// submitted through the UI in the two live acceptance runs.
const VALID_AFOLU_INTAKE = {
  activityType: 'direct_planting',
  projectArea: 120,
  plantingDensityPerHectare: 40,
  preExistingWoodyBiomassCoverPercent: 4,
  landUseHistoryEligible: true,
  preProjectLandUseContinues: true,
  recentSimilarWoodyBiomassRemoved: false,
  soilInversionExceeds25cm: false,
  species: ['Rhizophora mucronata', 'Avicennia marina'],
  projectStartDate: '2026-06-01',
  creditingPeriodYears: 20,
};

const VALID_ENERGY_INTAKE = {
  technologyType: 'wind_onshore',
  installedCapacityMW: 75.6,
  hostCountry: 'India',
  gridConnected: true,
  commissioningDate: '2026-04-15',
  expectedAnnualGeneration: 197000,
  projectType: 'greenfield',
  bessIntegrated: false,
  gridEmissionFactorOption: 'ex_ante',
  creditingPeriodYears: 10,
};

describe('Methodology genericity (VM0047 vs VMR0017)', () => {
  describe('the same evaluator serves both methodologies', () => {
    it('finds VM0047 (AFOLU, census-based) eligible for valid land-use intake', () => {
      const { eligible, results } = evaluateApplicability(
        VM0047_CENSUS_BASED.applicabilityConditions as any,
        VALID_AFOLU_INTAKE
      );
      expect(eligible).equals(true);
      expect(results.some((r) => r.result === 'fail')).equals(false);
    });

    it('finds VMR0017 (energy, grid-displacement) eligible for valid generation intake', () => {
      const { eligible, results } = evaluateApplicability(
        VMR0017_GRID_RENEWABLE.applicabilityConditions as any,
        VALID_ENERGY_INTAKE
      );
      expect(eligible).equals(true);
      expect(results.some((r) => r.result === 'fail')).equals(false);
    });

    it('routes VMR0017 matrix conditions to human review rather than guessing', () => {
      // technology/geography, hydro capacity cap and BESS colocation are
      // `manual_review` — they must surface as needs_review, never silently
      // pass or fail, or a verifier inherits an unchecked claim.
      const { results } = evaluateApplicability(
        VMR0017_GRID_RENEWABLE.applicabilityConditions as any,
        VALID_ENERGY_INTAKE
      );
      const manualKeys = (VMR0017_GRID_RENEWABLE.applicabilityConditions as any[])
        .filter((c) => c.operator === 'manual_review')
        .map((c) => c.key);
      expect(manualKeys.length).to.be.greaterThan(0);
      manualKeys.forEach((key: string) => {
        const result = results.find((r) => r.key === key);
        expect(result, `condition ${key} missing from results`).to.exist;
        expect(result!.result, `condition ${key}`).equals('needs_review');
      });
    });

    it('still fails a real VM0047 threshold breach (engine is not vacuously permissive)', () => {
      // Pre-existing woody biomass cover must be < 10%; 25% must fail.
      const { eligible } = evaluateApplicability(
        VM0047_CENSUS_BASED.applicabilityConditions as any,
        { ...VALID_AFOLU_INTAKE, preExistingWoodyBiomassCoverPercent: 25 }
      );
      expect(eligible).equals(false);
    });

    it('reports missing inputs as needs_review, not as passes', () => {
      const { results } = evaluateApplicability(
        VMR0017_GRID_RENEWABLE.applicabilityConditions as any,
        {}
      );
      expect(results.every((r) => r.result !== 'pass')).equals(true);
    });
  });

  describe('both methodologies satisfy the shared structural contract', () => {
    const methodologies = [
      { name: 'VM0047', doc: VM0047_CENSUS_BASED },
      { name: 'VMR0017', doc: VMR0017_GRID_RENEWABLE },
    ];

    // The generic IntakeForm renders purely from requiredInputs, so every entry
    // must carry what the renderer switches on. A seed missing dataType renders
    // a silently blank field — the failure mode this guards.
    const RENDERABLE_TYPES = ['string', 'number', 'date', 'boolean', 'select', 'multiselect', 'file'];

    methodologies.forEach(({ name, doc }) => {
      it(`${name}: every requiredInput is renderable by the generic form`, () => {
        const inputs = (doc.requiredInputs || []) as any[];
        expect(inputs.length).to.be.greaterThan(0);
        inputs.forEach((field) => {
          expect(field.key, `${name} field missing key`).to.be.a('string').and.not.empty;
          expect(field.label, `${name}/${field.key} missing label`).to.be.a('string').and.not.empty;
          expect(RENDERABLE_TYPES, `${name}/${field.key} has unrenderable dataType '${field.dataType}'`)
            .to.include(field.dataType);
          // A single `select` with no options renders an empty dropdown the
          // user can never satisfy — always a seed bug. A `multiselect` may
          // legitimately omit options (open-ended values like species); the
          // form renders those as free-entry.
          if (field.dataType === 'select') {
            expect(field.options, `${name}/${field.key} is a select with no options`)
              .to.be.an('array').that.is.not.empty;
          }
        });
      });

      it(`${name}: every applicability condition can be evaluated or escalated`, () => {
        const conditions = (doc.applicabilityConditions || []) as any[];
        expect(conditions.length).to.be.greaterThan(0);
        const { results } = evaluateApplicability(conditions, {});
        expect(results.length).equals(conditions.length);
        conditions.forEach((c) => {
          expect(c.key, `${name} condition missing key`).to.be.a('string').and.not.empty;
          expect(c.statement, `${name}/${c.key} missing statement`).to.be.a('string').and.not.empty;
        });
      });

      it(`${name}: sectionGuidance covers the canonical section set with valid contentTypes`, () => {
        const guidance = (doc.sectionGuidance || []) as any[];
        // The generation service routes on contentType; an unknown value would
        // fall through to the wrong generator.
        guidance.forEach((g) => {
          expect(['structured', 'narrative'], `${name}/${g.section} contentType`)
            .to.include(g.contentType);
          expect(g.promptFragment, `${name}/${g.section} missing promptFragment`)
            .to.be.a('string').and.not.empty;
        });
        const sections = guidance.map((g) => g.section);
        // additionality + baseline_scenario are the two the pipeline prioritises
        // and generates with fixed structured shapes; both must be present.
        expect(sections, `${name} missing additionality guidance`).to.include('additionality');
        expect(sections, `${name} missing baseline_scenario guidance`).to.include('baseline_scenario');
      });
    });

    it('the two methodologies are genuinely different shapes (guards a copy-paste seed)', () => {
      const afoluKeys = (VM0047_CENSUS_BASED.requiredInputs as any[]).map((f) => f.key).sort();
      const energyKeys = (VMR0017_GRID_RENEWABLE.requiredInputs as any[]).map((f) => f.key).sort();
      expect(afoluKeys).to.not.deep.equal(energyKeys);
      expect(VM0047_CENSUS_BASED.sector).to.not.equal(VMR0017_GRID_RENEWABLE.sector);
    });
  });
});
