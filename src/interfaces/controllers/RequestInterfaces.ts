export interface ICreateProjectRequest {
  name: string;
  sector: string;
}

export interface ISelectMethodologyRequest {
  projectId: string;
  methodologyId: string;
}

export interface ISubmitIntakeRequest {
  projectId: string;
  intake: { [key: string]: any };
}

export interface IProjectTransitionRequest {
  projectId: string;
  toStatus: string;
}

export interface IGenerateSectionRequest {
  projectId: string;
  sectionKey: string;
}

export interface IGenerateAllSectionsRequest {
  projectId: string;
  /** Resume a partially failed run: generate only sections that have not
   *  already produced content, instead of regenerating everything. */
  onlyMissing?: boolean;
}

export interface IRefineSectionRequest {
  projectId: string;
  sectionKey: string;
  message: string;
}

export interface IGenerateCoverNoteRequest {
  projectId: string;
}

export interface ISuperAdminRequest {
  username: string,
  password: string,
  permission: any[]
}


export interface IReviewCaseRequest {
  projectId: string;
}

export interface IResolveFindingRequest {
  findingId: string;
  projectId: string;
  status: string; // 'open' | 'accepted' | 'rejected' | 'resolved'
  resolutionNote?: string;
}

export interface IOpenPeriodsRequest {
  projectId: string;
  // Overrides the annual default. Provided rather than derived, because the
  // methodology's frequency strings cannot be parsed into a cadence.
  periodLengthMonths?: number;
}

export interface IRecordParameterRequest {
  periodId: string;
  parameter: string;
  value?: string;
  evidenceDocumentIds?: string[];
  // Supplying this marks the parameter not applicable. An exclusion with no
  // reason is a finding, so the reason is the switch rather than a flag.
  notApplicableReason?: string;
}

export interface ISubmitPeriodRequest {
  periodId: string;
}
