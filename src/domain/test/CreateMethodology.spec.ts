import { expect } from 'chai';
import { CreateMethodology } from '../methodology/CreateMethodology';

describe('Test class CreateMethodology', () => {

  const validMethodology: any = {
    code: 'VM0047',
    version: '1.1',
    title: 'Afforestation, Reforestation, and Revegetation',
    standard: 'VCS',
    sector: 'AFOLU',
    requiredInputs: [{ key: 'projectArea', label: 'Project area', dataType: 'number', required: true }],
    baselineFormula: { description: 'Zero baseline by assumption.', variables: [], relationship: 'CR_t = deltaC_WP,t - PE_t' },
    sourceReference: { name: 'VM0047 v1.1', url: 'https://verra.org/methodologies/vm0047-afforestation-reforestation-and-revegetation-v1-1/', publisher: 'Verra' },
  };

  it('sets the supplied fields and defaults status to active', () => {
    const createMethodology = new CreateMethodology(validMethodology);
    expect(createMethodology.code).equals('VM0047');
    expect(createMethodology.version).equals('1.1');
    expect(createMethodology.status).equals('active');
  });

  it('defaults array fields to empty arrays when omitted', () => {
    const createMethodology = new CreateMethodology(validMethodology);
    expect(createMethodology.applicabilityConditions).to.deep.equal([]);
    expect(createMethodology.additionalityTiers).to.deep.equal([]);
    expect(createMethodology.monitoringParameters).to.deep.equal([]);
    expect(createMethodology.sectionGuidance).to.deep.equal([]);
  });

  it('throws when code is missing', () => {
    const { code, ...rest } = validMethodology;
    expect(() => new CreateMethodology(rest)).to.throw('methodology code missing!');
  });

  it('throws when requiredInputs is empty', () => {
    const rest = { ...validMethodology, requiredInputs: [] };
    expect(() => new CreateMethodology(rest)).to.throw('methodology requiredInputs missing!');
  });

  it('throws when baselineFormula is missing', () => {
    const { baselineFormula, ...rest } = validMethodology;
    expect(() => new CreateMethodology(rest)).to.throw('methodology baselineFormula missing!');
  });

  it('throws when sourceReference is missing', () => {
    const { sourceReference, ...rest } = validMethodology;
    expect(() => new CreateMethodology(rest)).to.throw('methodology sourceReference missing!');
  });

});
