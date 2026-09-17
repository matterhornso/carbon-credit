import { IRegistryInterface } from '../../../domain/registry/registryInterface';

/**
 * Registry document templates.
 *
 * VCS is not new content — it is the ten-section scaffold that was already
 * duplicated inside both seeded methodologies, lifted to the place it belongs.
 * Resolving VCS + VM0047 reproduces VM0047's previous section list exactly, and
 * a test asserts that rather than trusting the transcription.
 *
 * Gold Standard is the reason the lift was worth doing. It is a genuinely
 * different document — different sections, different order, different
 * mandatory content (SDG contributions and a stakeholder consultation report
 * are GS-specific and have no VCS equivalent). Before this split, a GS
 * methodology authored by copying a VCS seed would have produced a VCS-shaped
 * document and nothing would have caught it.
 */

const VCS: IRegistryInterface = {
  code: 'VCS',
  name: 'Verra Verified Carbon Standard',
  status: 'active',
  documentTemplate: {
    documentName: 'Project Description (VCS PDD)',
    sections: [
      {
        key: 'project_description',
        title: 'Project Description',
        order: 1,
        required: true,
        contentType: 'narrative',
        registryGuidance: 'Describe the project activity, its location, the technologies or measures employed, and the entity implementing it. State the project start date and explain how it was determined.',
      },
      {
        key: 'project_boundary',
        title: 'Project Boundary',
        order: 2,
        required: true,
        contentType: 'structured',
        registryGuidance: 'Define the spatial extent and the GHG sources, sinks and reservoirs included in and excluded from the project boundary, with a stated reason for each exclusion.',
      },
      {
        key: 'methodology_application',
        title: 'Application of the Methodology',
        order: 3,
        required: true,
        contentType: 'narrative',
        registryGuidance: 'Identify the methodology applied, including version, and demonstrate that the project meets each of its applicability conditions. Address every condition explicitly; a condition left unaddressed is treated as unmet.',
      },
      {
        key: 'additionality',
        title: 'Demonstration of Additionality',
        order: 4,
        required: true,
        contentType: 'structured',
        registryGuidance: 'Demonstrate additionality using the approach the methodology requires. Each step must be supported by evidence; an assertion without a cited source does not satisfy this section.',
      },
      {
        key: 'baseline_scenario',
        title: 'Baseline Scenario',
        order: 5,
        required: true,
        contentType: 'narrative',
        registryGuidance: 'Identify the baseline scenario and justify it against the alternatives the methodology requires you to consider. State plainly where the methodology fixes the baseline by assumption rather than by analysis.',
      },
      {
        key: 'quantification',
        title: 'Quantification of GHG Emission Reductions and Removals',
        order: 6,
        required: true,
        contentType: 'structured',
        registryGuidance: 'Present the ex-ante estimate using the methodology\'s equations, with every parameter identified and sourced. Show the equations as applied to this project, not in their general form.',
      },
      {
        key: 'monitoring',
        title: 'Monitoring',
        order: 7,
        required: true,
        contentType: 'structured',
        registryGuidance: 'List the parameters monitored, their measurement methods, frequency, and QA/QC procedures, drawn from the methodology\'s Data and Parameters Monitored table and scaled to this project.',
      },
      {
        key: 'data_quality_management',
        title: 'Data and Quality Management',
        order: 8,
        required: true,
        contentType: 'narrative',
        registryGuidance: 'Describe the data collection protocol, record-keeping, and the procedures for handling missing or anomalous data. State the conservative treatment applied when data is unavailable.',
      },
      {
        key: 'safeguards',
        title: 'Environmental and Social Safeguards',
        order: 9,
        required: true,
        contentType: 'narrative',
        registryGuidance: 'Address stakeholder consultation, environmental impact, and the applicable VCS safeguard requirements. Do not assert compliance with a safeguard for which no supporting material was provided.',
      },
      {
        key: 'crediting',
        title: 'Crediting Period',
        order: 10,
        required: true,
        contentType: 'structured',
        registryGuidance: 'State the crediting period start date and length, and whether it is renewable, consistent with what the methodology and the VCS Standard permit.',
      },
    ],
  },
  rules: {
    maxCreditingPeriodYears: 40,
    creditingPeriodRenewable: true,
    maxProjectStartBacklogYears: 5,
    bufferPoolApplies: true,
    additionalityApproach: 'Methodology-specified; commonly the VCS additionality tool or a methodology-internal test.',
    validationRequired: true,
    notes: 'AFOLU projects contribute to the VCS non-permanence risk buffer pool; the deduction is set by the risk assessment, not by this field.',
  },
  sourceReference: {
    name: 'VCS Standard',
    url: 'https://verra.org/programs/verified-carbon-standard/',
    publisher: 'Verra',
  },
};

const GOLD_STANDARD: IRegistryInterface = {
  code: 'GS',
  name: 'Gold Standard for the Global Goals',
  status: 'active',
  documentTemplate: {
    documentName: 'Project Design Document (GS4GG PDD)',
    sections: [
      {
        key: 'project_description',
        title: 'Project Description',
        order: 1,
        required: true,
        contentType: 'narrative',
        registryGuidance: 'Describe the project activity, its purpose, location and implementing entity, and state the project start date.',
      },
      {
        key: 'safeguarding_principles',
        title: 'Safeguarding Principles and Requirements Assessment',
        order: 2,
        required: true,
        contentType: 'structured',
        registryGuidance: 'Assess the project against each Gold Standard Safeguarding Principle, recording the assessment outcome and the mitigation measure where a risk is identified. This assessment is mandatory and has no VCS equivalent — an unassessed principle blocks registration.',
      },
      {
        key: 'stakeholder_consultation',
        title: 'Stakeholder Consultation Report',
        order: 3,
        required: true,
        contentType: 'narrative',
        registryGuidance: 'Report the stakeholder consultation: who was consulted, how they were identified and invited, what was raised, and how each input was addressed. Gold Standard requires a documented consultation round before validation; describing an intention to consult does not satisfy it.',
      },
      {
        key: 'sdg_contributions',
        title: 'Sustainable Development Goal Contributions',
        order: 4,
        required: true,
        contentType: 'structured',
        registryGuidance: 'Identify at least three SDGs the project contributes to, including SDG 13. For each, state the targeted impact, the indicator monitored, and the baseline value. Gold Standard certifies SDG impact alongside emission reductions, so an unquantified contribution is incomplete.',
      },
      {
        key: 'methodology_application',
        title: 'Application of Methodology',
        order: 5,
        required: true,
        contentType: 'narrative',
        registryGuidance: 'Identify the approved methodology and version, and demonstrate compliance with each applicability condition.',
      },
      {
        key: 'additionality',
        title: 'Additionality',
        order: 6,
        required: true,
        contentType: 'structured',
        registryGuidance: 'Demonstrate additionality per the methodology and the Gold Standard additionality requirements, evidencing each step.',
      },
      {
        key: 'baseline_scenario',
        title: 'Baseline Scenario and Emission Reductions',
        order: 7,
        required: true,
        contentType: 'narrative',
        registryGuidance: 'Identify the baseline scenario and quantify expected emission reductions using the methodology\'s equations with project-specific parameters.',
      },
      {
        key: 'monitoring',
        title: 'Monitoring Plan',
        order: 8,
        required: true,
        contentType: 'structured',
        registryGuidance: 'Set out the monitoring plan covering both emission-reduction parameters and the SDG indicators declared above — Gold Standard monitors both, and an SDG indicator with no monitoring entry will not certify.',
      },
      {
        key: 'crediting',
        title: 'Crediting Period',
        order: 9,
        required: true,
        contentType: 'structured',
        registryGuidance: 'State the crediting period start and length within the limits the Gold Standard permits for this project type.',
      },
    ],
  },
  rules: {
    maxCreditingPeriodYears: 21,
    creditingPeriodRenewable: true,
    maxProjectStartBacklogYears: 1,
    bufferPoolApplies: false,
    additionalityApproach: 'Methodology-specified, plus Gold Standard additionality requirements.',
    validationRequired: true,
    notes: 'Requires a documented stakeholder consultation round and at least three SDG contributions including SDG 13. The one-year registration window is materially tighter than VCS\'s five, and is a common reason an otherwise-eligible project cannot go to Gold Standard.',
  },
  sourceReference: {
    name: 'Gold Standard for the Global Goals — Principles & Requirements',
    url: 'https://www.goldstandard.org/',
    publisher: 'Gold Standard Foundation',
  },
};

export const REGISTRIES: IRegistryInterface[] = [VCS, GOLD_STANDARD];

export { VCS, GOLD_STANDARD };
