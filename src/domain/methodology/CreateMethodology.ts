import {
  IMethodologyInterface,
  IApplicabilityCondition,
  IRequiredInput,
  IAdditionalityTier,
  IBaselineFormula,
  IMonitoringParameter,
  ISectionGuidance,
  ISourceReference,
} from './methodologyInterface';

export class CreateMethodology implements IMethodologyInterface {
  code!: string;
  version!: string;
  title!: string;
  standard!: string;
  status!: string;
  sector!: string;
  applicabilityConditions!: IApplicabilityCondition[];
  requiredInputs!: IRequiredInput[];
  additionalityTiers!: IAdditionalityTier[];
  baselineFormula!: IBaselineFormula;
  monitoringParameters!: IMonitoringParameter[];
  sectionGuidance!: ISectionGuidance[];
  sourceReference!: ISourceReference;
  supersededBy?: string;

  constructor(methodology: IMethodologyInterface) {
    if (!methodology.code) throw new Error('methodology code missing!');
    if (!methodology.version) throw new Error('methodology version missing!');
    if (!methodology.title) throw new Error('methodology title missing!');
    if (!methodology.standard) throw new Error('methodology standard missing!');
    if (!methodology.sector) throw new Error('methodology sector missing!');
    if (!methodology.requiredInputs || !methodology.requiredInputs.length) throw new Error('methodology requiredInputs missing!');
    if (!methodology.baselineFormula) throw new Error('methodology baselineFormula missing!');
    if (!methodology.sourceReference) throw new Error('methodology sourceReference missing!');

    this.code = methodology.code;
    this.version = methodology.version;
    this.title = methodology.title;
    this.standard = methodology.standard;
    this.status = methodology.status || 'active';
    this.sector = methodology.sector;
    this.applicabilityConditions = methodology.applicabilityConditions || [];
    this.requiredInputs = methodology.requiredInputs;
    this.additionalityTiers = methodology.additionalityTiers || [];
    this.baselineFormula = methodology.baselineFormula;
    this.monitoringParameters = methodology.monitoringParameters || [];
    this.sectionGuidance = methodology.sectionGuidance || [];
    this.sourceReference = methodology.sourceReference;
    this.supersededBy = methodology.supersededBy;
  }
}
