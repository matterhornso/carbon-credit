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
