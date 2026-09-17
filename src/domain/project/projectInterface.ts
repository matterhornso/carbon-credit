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

/**
 * A page of projects. `total` is the count matching the query, not the count
 * returned - a caller that gets 50 items and a total of 600 knows to ask for
 * more, which is the whole reason the count is worth a second query.
 */
export interface IProjectPage {
  items: IProjectInterface[];
  total: number;
  limit: number;
  skip: number;
}
