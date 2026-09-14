// Uses the real seeded methodologies rather than fixtures: the analyser's whole
// job is to reflect what a methodology actually demands, so a fixture that
// drifted from what ships would test nothing worth knowing.

import { expect } from 'chai';
import { analyseEvidenceGaps } from '../../application/usecases/project_lifecycle/EvidenceGapAnalyzer';
import {
  VM0047_CENSUS_BASED,
  VMR0017_GRID_RENEWABLE,
} from '../../infrastructure/database/seed/methodology.seed';

const ENERGY_INTAKE = {
  technologyType: 'wind_onshore', installedCapacityMW: 75.6, hostCountry: 'India',
  gridConnected: true, commissioningDate: '2025-03-18', expectedAnnualGeneration: 198400,
  projectType: 'greenfield', bessIntegrated: false,
  gridEmissionFactorOption: 'ex_ante_combined_margin', creditingPeriodYears: 10,
};

const AFOLU_INTAKE = {
  activityType: 'direct_planting', projectArea: 120, plantingUnitCensus: 4800, plantingDensityPerHectare: 40,
  preExistingWoodyBiomassCoverPercent: 4, landUseHistoryEligible: true,
  preProjectLandUseContinues: true, recentSimilarWoodyBiomassRemoved: false,
  soilInversionExceeds25cm: false, species: ['Rhizophora mucronata'],
  projectStartDate: '2026-06-01', creditingPeriodYears: 20,
};

const doc = (over: any = {}) => ({
  filename: 'evidence.pdf', extractedText: 'Substantive content.',
  linkedSections: [], status: 'processed', ...over,
});

describe('Test evidence gap analysis', () => {

  describe('intake', () => {

    it('flags every required input on an empty project as blocking', () => {
      const report = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: {} } as any, []);
      const requiredCount = (VMR0017_GRID_RENEWABLE.requiredInputs || []).filter((f) => f.required).length;
      const intakeGaps = report.gaps.filter((g) => g.category === 'intake');

      expect(intakeGaps).to.have.lengthOf(requiredCount);
      intakeGaps.forEach((g) => expect(g.severity).equals('blocking'));
      expect(report.readyToGenerate).equals(false);
    });

    it('raises no intake gap once every required field is supplied', () => {
      const report = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: ENERGY_INTAKE } as any, [doc()]);
      expect(report.gaps.filter((g) => g.category === 'intake')).to.be.empty;
    });

    it('treats an empty string or empty array as missing, not as an answer', () => {
      const report = analyseEvidenceGaps(
        VM0047_CENSUS_BASED,
        { intake: { ...AFOLU_INTAKE, species: [], activityType: '  ' } } as any, [doc()]
      );
      const keys = report.gaps.filter((g) => g.category === 'intake').map((g) => g.key);
      expect(keys).to.include.members(['species', 'activityType']);
    });

  });

  describe('applicability', () => {

    it('surfaces manual-review conditions as needing a human determination', () => {
      const report = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: ENERGY_INTAKE } as any, [doc()]);
      const manual = (VMR0017_GRID_RENEWABLE.applicabilityConditions || [])
        .filter((c) => c.operator === 'manual_review');
      const gaps = report.gaps.filter((g) => g.category === 'applicability');

      expect(gaps.length).to.be.at.least(manual.length);
      gaps.forEach((g) => expect(g.whatToProvide).to.be.a('string').that.is.not.empty);
    });

    // The point of doing this at intake: an uncheckable eligibility condition
    // is worth knowing about before commissioning anything.
    it('blocks when a condition cannot be evaluated for want of its input', () => {
      const withoutTech: any = { ...ENERGY_INTAKE };
      delete withoutTech.gridConnected;
      const report = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: withoutTech } as any, [doc()]);

      const blocked = report.gaps.filter(
        (g) => g.category === 'applicability' && g.severity === 'blocking'
      );
      expect(blocked.length).to.be.at.least(1);
      expect(blocked[0].summary).to.match(/cannot be evaluated/);
    });

  });

  describe('additionality and baseline', () => {

    it('flags every additionality tier when no evidence is attached', () => {
      const report = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: ENERGY_INTAKE } as any, []);
      const tiers = (VMR0017_GRID_RENEWABLE.additionalityTiers || []).filter((t) => (t.requiredEvidence || []).length);
      const gaps = report.gaps.filter((g) => g.category === 'additionality' && g.severity === 'required');

      expect(gaps).to.have.lengthOf(tiers.length);
      gaps.forEach((g) => expect(g.whatToProvide).to.match(/Upload documents covering/));
    });

    it('downgrades to advisory once evidence exists, without claiming it is sufficient', () => {
      const report = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: ENERGY_INTAKE } as any, [doc()]);
      const gaps = report.gaps.filter((g) => g.category === 'additionality');

      expect(gaps.every((g) => g.severity === 'advisory')).equals(true);
      expect(gaps[0].summary).to.match(/confirm they cover/);
    });

    // A reference value comes from outside the project, so a complete intake
    // never satisfies it — this is the usual reason quantification stalls.
    it('always requires a published figure for reference variables', () => {
      const report = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: ENERGY_INTAKE } as any, [doc()]);
      const refs = (VMR0017_GRID_RENEWABLE.baselineFormula?.variables || []).filter((v) => v.source === 'reference');
      const gaps = report.gaps.filter(
        (g) => g.category === 'baseline' && /published reference value/.test(g.summary)
      );

      expect(gaps).to.have.lengthOf(refs.length);
      expect(gaps.length).to.be.at.least(1);
    });

    // Found by this analyser on its first run against the real seeds: a
    // baseline variable declared as coming from intake, with no intake field
    // defined that supplies it. No evidence the developer produces can close
    // that, so it must not be reported as their omission.
    it('separates a methodology definition defect from a missing document', () => {
      const report = analyseEvidenceGaps(VM0047_CENSUS_BASED, { intake: AFOLU_INTAKE } as any, [doc()]);
      const defect = report.gaps.find((g) => /defines no intake field/.test(g.summary));

      expect(defect, 'VM0047 M_t is declared source:input with no supplying field').to.exist;
      expect(defect!.severity).equals('required');
      expect(defect!.whatToProvide).to.match(/gap in the methodology definition/);
      // Crucially not blocking: the developer cannot act on it.
      expect(report.readyToGenerate).equals(true);
    });

  });

  describe('unreadable evidence', () => {

    it('reports an upload that yielded no text, because nothing can cite it', () => {
      const report = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: ENERGY_INTAKE } as any, [
        doc({ filename: 'scan.pdf', status: 'failed', extractedText: '' }),
      ]);
      const gap = report.gaps.find((g) => g.category === 'evidence');

      expect(gap, 'a failed upload must be reported').to.exist;
      expect(gap!.key).equals('scan.pdf');
      expect(gap!.whatToProvide).to.match(/text-based/);
    });

    it('does not count an unreadable document as supporting evidence', () => {
      const report = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: ENERGY_INTAKE } as any, [
        doc({ status: 'failed', extractedText: '' }),
      ]);
      // Additionality should still read as unevidenced, not merely advisory.
      expect(report.gaps.some((g) => g.category === 'additionality' && g.severity === 'required')).equals(true);
    });

  });

  describe('report shape', () => {

    it('is ready to generate only when nothing blocking remains', () => {
      const empty = analyseEvidenceGaps(VM0047_CENSUS_BASED, { intake: {} } as any, []);
      const full = analyseEvidenceGaps(VM0047_CENSUS_BASED, { intake: AFOLU_INTAKE } as any, [doc()]);

      expect(empty.readyToGenerate).equals(false);
      expect(full.readyToGenerate).equals(true);
      // Ready to generate is not the same as ready to submit.
      expect(full.gaps.length).to.be.greaterThan(0);
    });

    it('orders gaps by severity so the blocking ones are read first', () => {
      const report = analyseEvidenceGaps(VM0047_CENSUS_BASED, { intake: {} } as any, []);
      const order = report.gaps.map((g) => g.severity);
      const rank: any = { blocking: 0, required: 1, advisory: 2 };
      const sorted = [...order].sort((a, b) => rank[a] - rank[b]);

      expect(order).deep.equals(sorted);
      expect(report.counts.blocking).equals(order.filter((s) => s === 'blocking').length);
    });

    // Genericity, same as everywhere else: one analyser, two unrelated sectors.
    it('works for both seeded methodologies with no methodology-specific code', () => {
      const afolu = analyseEvidenceGaps(VM0047_CENSUS_BASED, { intake: AFOLU_INTAKE } as any, [doc()]);
      const energy = analyseEvidenceGaps(VMR0017_GRID_RENEWABLE, { intake: ENERGY_INTAKE } as any, [doc()]);

      expect(afolu.methodologyCode).equals('VM0047');
      expect(energy.methodologyCode).equals('VMR0017');
      [afolu, energy].forEach((r) => {
        expect(r.readyToGenerate).equals(true);
        r.gaps.forEach((g) => {
          expect(g.summary).to.be.a('string').that.is.not.empty;
          expect(g.whatToProvide).to.be.a('string').that.is.not.empty;
        });
      });
    });

  });
});
