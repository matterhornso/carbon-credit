import { expect } from 'chai';
import { assertValidTransition, assertIntakeComplete } from '../../application/usecases/project_lifecycle/ProjectLifecycle';
import { PROJECT_STATUSES } from '../project/projectStatus';

describe('Test project lifecycle guards', () => {

  describe('assertValidTransition', () => {
    it('allows DRAFT_INTAKE -> METHODOLOGY_SELECTED', () => {
      expect(() => assertValidTransition(PROJECT_STATUSES.DRAFT_INTAKE, PROJECT_STATUSES.METHODOLOGY_SELECTED)).not.to.throw();
    });

    it('rejects skipping a state (DRAFT_INTAKE -> INPUTS_SUBMITTED)', () => {
      expect(() => assertValidTransition(PROJECT_STATUSES.DRAFT_INTAKE, PROJECT_STATUSES.INPUTS_SUBMITTED)).to.throw(/Cannot transition/);
    });

    it('rejects an unknown source status', () => {
      expect(() => assertValidTransition('NOT_A_REAL_STATUS', PROJECT_STATUSES.DRAFT_INTAKE)).to.throw(/Unknown project status/);
    });

    it('allows the CASE_DRAFT_READY -> CASE_GENERATING regenerate loop', () => {
      expect(() => assertValidTransition(PROJECT_STATUSES.CASE_DRAFT_READY, PROJECT_STATUSES.CASE_GENERATING)).not.to.throw();
    });

    it('rejects transitions out of the terminal VERIFIED status', () => {
      expect(() => assertValidTransition(PROJECT_STATUSES.VERIFIED, PROJECT_STATUSES.CASE_DRAFT_READY)).to.throw(/Cannot transition/);
    });
  });

  describe('assertIntakeComplete', () => {
    const requiredInputs: any = [
      { key: 'projectArea', required: true },
      { key: 'species', required: true },
      { key: 'fertilizerUse', required: false },
    ];

    it('passes when all required fields are present', () => {
      expect(() => assertIntakeComplete(requiredInputs, { projectArea: 10, species: ['Teak'] })).not.to.throw();
    });

    it('ignores missing optional fields', () => {
      expect(() => assertIntakeComplete(requiredInputs, { projectArea: 10, species: ['Teak'] })).not.to.throw();
    });

    it('throws listing every missing required field', () => {
      expect(() => assertIntakeComplete(requiredInputs, {})).to.throw('Missing required intake fields: projectArea, species');
    });
  });

});
