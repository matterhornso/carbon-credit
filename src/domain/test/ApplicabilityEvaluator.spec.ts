import { expect } from 'chai';
import { evaluateApplicability } from '../../application/usecases/project_lifecycle/ApplicabilityEvaluator';

describe('Test evaluateApplicability', () => {

  const conditions: any = [
    { key: 'density_cap', statement: 'Density must not exceed 50 units/ha.', checksInputKey: 'plantingDensityPerHectare', operator: 'lte', value: '50' },
    { key: 'manual_check', statement: 'Technology/capacity/geography matrix.', checksInputKey: 'technologyType', operator: 'manual_review', guidance: 'Check Table 1.' },
  ];

  it('passes a condition whose input satisfies the operator', () => {
    const { results, eligible } = evaluateApplicability(conditions, { plantingDensityPerHectare: 40, technologyType: 'wind_onshore' });
    expect(results[0].result).equals('pass');
  });

  it('fails a condition whose input violates the operator', () => {
    const { results, eligible } = evaluateApplicability(conditions, { plantingDensityPerHectare: 60 });
    expect(results[0].result).equals('fail');
    expect(eligible).equals(false);
  });

  it('marks manual_review conditions as needs_review regardless of input', () => {
    const { results } = evaluateApplicability(conditions, { plantingDensityPerHectare: 40, technologyType: 'wind_onshore' });
    expect(results[1].result).equals('needs_review');
  });

  it('marks a condition needs_review when its input is not yet supplied', () => {
    const { results } = evaluateApplicability(conditions, {});
    expect(results[0].result).equals('needs_review');
  });

  it('overall eligible is false if any condition fails, true if none fail', () => {
    expect(evaluateApplicability(conditions, { plantingDensityPerHectare: 60 }).eligible).equals(false);
    expect(evaluateApplicability(conditions, { plantingDensityPerHectare: 40 }).eligible).equals(true);
  });

});
