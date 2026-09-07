import { ICredit_period, IParty_and_project_participants, IMethodologies } from "../../domain/project_section_a/projectSectionAInterface";
import { IShut_down_details, ISummary_of_implementation_milestones } from "../../domain/project_section_b/projectSectionBInterface";

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

export interface ICreateReportRequest {
  project_id: string;
  current_month?: string;
  next_date?: Date;
  quantity?: string;
  ghg_reduction_explanation?: string;
  id?:string;
}

export interface ISuperAdminRequest {
  username: string,
  password: string,
  permission: any[]
}

export interface ICreateProjectSectionARequest {
  project_id: string;
}


export interface ICreateProjectSectionDRequest {
  project_id: string;
}

export interface ICreateProjectSectionERequest {
  project_id: string;
}

export interface ICreateSectionAStep1 {
  project_id: string;
  uuid: string;
  step1: {
    purpose_and_description: string;
    measure_taken_for_gas_emissions: string;
    brief_description_installed_tech: string;
    project_comissioning_date: Date;
    construction_date: string;
    operation_period: string;
    total_GHG_emission: string;
  }
}

export interface ICreateSectionAStep2 {
  project_id: string;
  uuid: string;
  step2: {
    country: string;
    state: string;
    city: string;
    village: string;
    pincode: string[];
    landmark: string;
    file_attach: string[];
  }
}

export interface ICreateSectionAStep3 {
  project_id: string;
  uuid: string;
  step3: {
    party_and_project_participants: IParty_and_project_participants[]
  }
}

export interface ICreateSectionAStep4 {
  project_id: string;
  uuid: string;
  step4: {
    methodologies: IMethodologies[]
  }
}

export interface ICreateSectionAStep5 {
  project_id: string;
  uuid: string;
  step5: {
    credit_start_period: Date;
    credit_period: ICredit_period;
    credit_period_description: string;
  }
}

export interface ICreateProjectSectionBRequest {
  project_id: string;
}

export interface ICreateSectionBStep1 {
  project_id: string;
  uuid: string;
  step1: {
    general_description: string;
    technical_description: string;
    data_tables_technical_description_attach: string[];
    operational_description: string;
    shut_down_details: IShut_down_details[];
    summary_of_implementation_milestones: ISummary_of_implementation_milestones[]
  }
}

export interface ICreateSectionBStep2 {
  project_id: string;
  uuid: string;
  step2: {
    temporary_deviation: string;
    corrections: string;
    permanent_changes_from_registered_monitoring_plan: string[];
    change_project_design: string;
    change_startDate_creditPeriod: Date;
    typeOf_changes_specific: string;
  }
}

export interface ICreateProjectSectionCRequest {
  project_id: string;
}
