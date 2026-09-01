export interface IProjectInterface {
  name?: string;
  proponentOrgId?: string;
  createdByUserId?: string;
  methodologyId?: string;
  sector?: string;
  location?: IProjectLocation;
  scale?: string;
  startDate?: Date;
  creditingPeriod?: IProjectCreditingPeriod;
  status?: string;
  intake?: Record<string, any>;
  attachments?: string[];
  caseDocumentId?: string;
}

export interface IProjectLocation {
  country?: string;
  state?: string;
  city?: string;
  description?: string;
}

export interface IProjectCreditingPeriod {
  start?: Date;
  end?: Date;
}
