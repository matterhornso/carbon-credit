import { Types } from 'mongoose';

export interface IProjectSectionA {
  _id?: Types.ObjectId;
  uuid?: string;
  project_id: string;
  step1?: IStep1,
  step2?: IStep2,
  step3?: IStep3,
  step4?: IStep4,
  step5?: IStep5,
}
export interface IStep1 {
  purpose_and_description: string;
  measure_taken_for_gas_emissions: string;
  brief_description_installed_tech: string;
  project_comissioning_date: Date;
  construction_date: string;
  operation_period: string;
  total_GHG_emission: string;
}
export interface IStep2 {
  country: string;
  state: string;
  city: string;
  village: string;
  pincode: string[];
  landmark: string;
  file_attach: string[];
}
export interface IStep3 {
  party_and_project_participants: IParty_and_project_participants[]
}
export interface IStep4 {
  methodologies: IMethodologies[]
}
export interface IStep5 {
  credit_start_period: Date;
  credit_period: ICredit_period;
  credit_period_description: string;
}

export interface IParty_and_project_participants {
  party_involved: string;
  private_or_public_project_participant: string;
  indicate_party_involved: string
}
export interface ICredit_period {
  start_date: Date;
  end_date: Date;
}
export interface IMethodologies {
  methodology: string;
  project_type: string;
  category: string;
  version: string;
  tools: string;
}