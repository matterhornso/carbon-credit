// A fully analysed worked example, so the platform can be walked end to end
// without a live model call.
//
// The analysis below was written by a human-equivalent reviewer rather than
// produced by this service's generation pipeline. It is included because the
// point of the product is not that a model writes prose — it is the discipline
// the prose is held to: every claim carries a citation, a claim with no
// supporting evidence is marked as needing evidence rather than asserted, and
// a conflict between what the developer stated and what their documents say is
// surfaced instead of smoothed over.
//
// Two gaps are deliberate and real, not decoration: the common-practice tier
// has no supporting study, and the grid emission factor has no published
// figure attached. A tool that filled those in convincingly would be worse
// than useless to a validator.
//
// Idempotent: skips if the example project already exists.

import mongoose from 'mongoose';
import { MongoConnection } from '../MongoConnection';
import { ProjectModel } from '../modal/project/project.model';
import { CaseDocumentModel } from '../modal/case_document/case_document.model';
import { SourceDocumentModel } from '../modal/source_document/source_document.model';
import { MethodologyModel } from '../modal/methodology/methodology.model';
import { TenantModel } from '../modal/tenant/tenant.model';

const PROJECT_NAME = 'Example — Bagalkot onshore wind, Karnataka (75.6 MW)';

const INTAKE = {
  technologyType: 'wind_onshore',
  installedCapacityMW: 75.6,
  hostCountry: 'India',
  gridConnected: true,
  commissioningDate: '2025-03-18',
  expectedAnnualGeneration: 198400,
  projectType: 'greenfield',
  bessIntegrated: false,
  gridEmissionFactorOption: 'ex_ante_combined_margin',
  creditingPeriodYears: 10,
};

const SOURCES = [
  {
    filename: 'grid-connection-and-metering-spec.pdf',
    excerptId: 'SRC-1',
    extractedText:
      'The facility connects to the Karnataka state transmission network at 132 kV via a dedicated feeder. ' +
      'Net export is measured at the substation boundary by a bi-directional ABB meter class 0.2S, calibrated annually. ' +
      'Installed capacity is 75.6 MW across 24 turbines of 3.15 MW each, commissioned 18 March 2025.',
  },
  {
    filename: 'board-investment-memo-2024.pdf',
    excerptId: 'SRC-2',
    extractedText:
      'Project IRR without carbon revenue is modelled at 9.1% against the board hurdle rate of 12.0% for ' +
      'greenfield renewable assets. The investment committee approved conditional on carbon finance closing the gap. ' +
      'Land clearing for the access road corridor was completed in Q2 2024.',
  },
];

// --- the analysis -----------------------------------------------------------

const ADDITIONALITY = {
  tiers: [
    {
      tier: '2a',
      tierName: 'Regulatory surplus',
      argument:
        'India imposes no law or regulation compelling this project. Renewable Purchase Obligations bind distribution ' +
        'licensees to procure a share of renewable energy; they do not require any particular generator to be built, and ' +
        'so do not remove the surplus for a merchant greenfield asset. The project is therefore not a response to a ' +
        'mandate on the proponent.',
      evidenceCited: ['Regulatory status of the host country'],
      citations: [
        {
          claim: 'The project is a greenfield asset in India commissioned in March 2025.',
          source: 'source_document', sourceDetail: 'SRC-1', verified: true,
        },
        {
          claim: 'Regulatory surplus is assessed against obligations binding on the project proponent.',
          source: 'methodology_reference', sourceDetail: 'VMR0017 / VT0008 Step 1',
        },
      ],
      needsEvidence: false,
    },
    {
      tier: '4a',
      tierName: 'Investment analysis',
      argument:
        'The project returns 9.1% IRR without carbon revenue against a board hurdle rate of 12.0%, a shortfall of 2.9 ' +
        'percentage points, and the investment committee made approval conditional on carbon finance. The financial case ' +
        'therefore does not stand on its own, which is what the benchmark test asks. Note the figures are the ' +
        'proponent’s own modelling: a validator will expect the underlying assumptions on capex, tariff and capacity ' +
        'factor to be supplied before accepting the benchmark comparison.',
      evidenceCited: ['Financial model', 'Board approval record'],
      citations: [
        {
          claim: 'IRR without carbon revenue is 9.1% against a 12.0% hurdle rate.',
          source: 'source_document', sourceDetail: 'SRC-2', verified: true,
        },
        {
          claim: 'Approval was conditional on carbon finance closing the return gap.',
          source: 'source_document', sourceDetail: 'SRC-2', verified: true,
        },
        {
          claim: 'The capex, tariff and capacity-factor assumptions behind the 9.1% figure have not been supplied.',
          source: 'none',
          sourceDetail: 'Provide the full financial model, and a sensitivity analysis on the most uncertain parameter.',
        },
      ],
      needsEvidence: true,
    },
    {
      tier: '3',
      tierName: 'Common practice',
      argument:
        'No common-practice analysis has been supplied, and none can responsibly be asserted here. Onshore wind is ' +
        'widely deployed in Karnataka, which makes this the tier most likely to attract a validation finding — the ' +
        'argument must show why this project is distinguishable from prevailing practice in the applicable geography, ' +
        'not merely that similar projects exist. Drafting a favourable narrative without the underlying data would ' +
        'produce exactly the kind of claim that fails at validation.',
      evidenceCited: [],
      citations: [
        {
          claim: 'No common-practice analysis has been provided for the applicable geography.',
          source: 'none',
          sourceDetail:
            'Supply the installed-capacity and project-count data for comparable onshore wind in the applicable region, ' +
            'and the basis for the distinguishing characteristics claimed.',
        },
      ],
      needsEvidence: true,
    },
  ],
  overallAssessment:
    'Regulatory surplus is well supported. Investment analysis is directionally supported by the board record but ' +
    'rests on unverified proponent modelling. Common practice is unsupported and is the weakest point in the case: on ' +
    'the evidence supplied today this case is not ready for submission, and the gap is in evidence rather than drafting.',
};

const BASELINE = {
  narrative:
    'The baseline is grid electricity that the project displaces. Under VMR0017 this is quantified with a combined-margin ' +
    'emission factor per VT0011 — an operating margin reflecting plants whose output changes with demand, and a build ' +
    'margin reflecting capacity additions — applied to net metered export. The proponent selected the ex-ante combined ' +
    'margin option, which fixes the factor for the crediting period and removes annual recalculation, at the cost of not ' +
    'tracking grid decarbonisation. As the Indian grid decarbonises, an ex-ante factor becomes progressively generous; ' +
    'a validator may reasonably ask why the ex-post option was not chosen.',
  variables: [
    {
      name: 'EG_facility_y', value: '198,400 MWh/yr (expected)',
      citations: [
        { claim: 'Expected annual net generation as stated at intake.', source: 'source_document', sourceDetail: 'SRC-1', verified: true },
        { claim: 'Metering is at the substation boundary, so the figure is net export rather than gross generation.', source: 'source_document', sourceDetail: 'SRC-1', verified: true },
      ],
    },
    {
      name: 'EF_grid_CM_y', value: 'NOT AVAILABLE',
      citations: [
        {
          claim: 'The combined-margin grid emission factor has not been supplied.',
          source: 'none',
          sourceDetail:
            'Attach the published grid emission factor for the applicable regional grid and vintage, with the operating ' +
            'and build margin components shown separately and the weighting applied.',
        },
      ],
    },
    {
      name: 'BE_y', value: 'NOT AVAILABLE — depends on EF_grid_CM_y',
      citations: [
        { claim: 'Baseline emissions cannot be computed until the grid emission factor is supplied.', source: 'none', sourceDetail: 'Blocked on EF_grid_CM_y above.' },
      ],
    },
    {
      name: 'EF_embodied', value: 'NOT AVAILABLE',
      citations: [
        { claim: 'The technology-specific embodied-emissions default for onshore wind has not been applied.', source: 'methodology_reference', sourceDetail: 'VMR0017 embodied-emissions defaults' },
      ],
    },
  ],
  formulaApplied:
    'ER_y = BE_y - PE_y - LE_y, with BE_y = EG_facility_y x EF_grid_CM_y. For onshore wind with no BESS, the project ' +
    'emission terms PE_FF, PE_GP, PE_HP, PE_BESS, PE_PSP and PE_FSS are all inapplicable, so PE_y = 0. ' +
    'LE_y = 198,400 x EF_embodied x 1e-3. Substituting what is known: ER_y = (198,400 x EF_grid_CM_y) - ' +
    '(198,400 x EF_embodied x 1e-3). Both factors remain outstanding, so no emission reduction figure is asserted.',
};

const narrative = (text: string, citations: any[]) => ({ text, citations });
const structured = (summary: string, fields: Record<string, string>, citations: any[]) => ({ summary, fields, citations });

const SECTIONS: Record<string, { content: any; warnings?: string[] }> = {
  additionality: { content: ADDITIONALITY },
  baseline_scenario: { content: BASELINE },
  project_description: {
    content: narrative(
      'A 75.6 MW greenfield onshore wind facility in Bagalkot district, Karnataka, comprising 24 turbines of 3.15 MW ' +
      'each, commissioned on 18 March 2025 and exporting to the Karnataka state transmission network at 132 kV.',
      [{ claim: 'Capacity, turbine count and commissioning date.', source: 'source_document', sourceDetail: 'SRC-1', verified: true }]
    ),
    // The contradiction check compares stated intake against uploaded documents.
    warnings: [
      'Intake records projectType as "greenfield" with commissioning on 2025-03-18, while SRC-2 states that land ' +
      'clearing for the access road corridor was completed in Q2 2024. Confirm the project start date used for ' +
      'crediting: if site preparation began in 2024, the start date and the crediting period may both be wrong.',
    ],
  },
  methodology_application: {
    content: narrative(
      'VMR0017 is applied together with ACM0002 v22.0. VMR0017 replaces four ACM0002 tools — additionality (VT0008), ' +
      'investment analysis (VT0009), common practice (VT0010) and grid emission factor (VT0011) — while leaving the ' +
      'project-boundary definition and the baseline-emissions calculation unchanged. Barrier analysis and the CDM ' +
      'positive list are not applicable and no such argument is made.',
      [{ claim: 'Tool substitutions and unchanged procedures.', source: 'methodology_reference', sourceDetail: 'VMR0017 v1.0' }]
    ),
  },
  project_boundary: {
    content: structured(
      'The generation facility and its grid interconnection point, per the ACM0002 project-boundary definition, which ' +
      'VMR0017 does not modify.',
      { spatialExtent: '24 turbines, Bagalkot district, Karnataka', interconnection: '132 kV dedicated feeder to the state transmission network', measurementPoint: 'Substation boundary, bi-directional meter' },
      [{ claim: 'Interconnection voltage and measurement point.', source: 'source_document', sourceDetail: 'SRC-1', verified: true }]
    ),
  },
  crediting: {
    content: structured(
      'A 10-year crediting period is claimed. The start date requires confirmation before this section can be relied on.',
      { creditingPeriodYears: '10', commissioningDate: '2025-03-18', startDateStatus: 'Unconfirmed — see the warning on project description' },
      [{ claim: 'Commissioning date as recorded in the metering specification.', source: 'source_document', sourceDetail: 'SRC-1', verified: true },
       { claim: 'The crediting start date has not been evidenced independently of the commissioning date.', source: 'none', sourceDetail: 'Supply the commissioning certificate and first-export meter reading.' }]
    ),
  },
  quantification: {
    content: structured(
      'ER_y = BE_y - PE_y - LE_y. For onshore wind without storage every project-emission term is inapplicable, so ' +
      'PE_y = 0. No emission reduction figure is asserted while the grid emission factor is outstanding.',
      { PE_y: '0 — no fossil, geothermal, reservoir or storage terms apply', LE_y: 'EG_facility_y x EF_embodied x 1e-3 — pending the embodied-emissions default', ER_y: 'Not computable until EF_grid_CM_y is supplied' },
      [{ claim: 'Project-emission terms are technology-conditional under VMR0017.', source: 'methodology_reference', sourceDetail: 'VMR0017 quantification' }]
    ),
  },
  monitoring: {
    content: structured(
      'Net generation is metered continuously at the substation boundary and aggregated monthly. No fire-suppression ' +
      'monitoring is required because no BESS is integrated.',
      { parameter: 'Net electricity exported to the grid', frequency: 'Continuous, aggregated monthly', method: 'Bi-directional revenue meter, class 0.2S, calibrated annually', bessMonitoring: 'Not applicable — no BESS integrated' },
      [{ claim: 'Meter class and calibration frequency.', source: 'source_document', sourceDetail: 'SRC-1', verified: true }]
    ),
  },
  data_quality_management: {
    content: narrative(
      'Metering QA/QC rests on annual calibration of the grid-interface meter against a traceable standard, with ' +
      'calibration certificates retained for the crediting period. No calibration records have been supplied yet, so ' +
      'the procedure is described rather than evidenced.',
      [{ claim: 'Annual calibration is specified for the grid-interface meter.', source: 'source_document', sourceDetail: 'SRC-1', verified: true },
       { claim: 'No calibration certificates have been provided.', source: 'none', sourceDetail: 'Supply the most recent calibration certificate and the retention procedure.' }]
    ),
  },
  safeguards: {
    content: narrative(
      'VMR0017 adds no technology-specific safeguard requirements beyond general VCS rules, and no stakeholder ' +
      'consultation or environmental assessment documents have been supplied. Nothing is asserted about safeguards ' +
      'compliance on the present evidence.',
      [{ claim: 'No stakeholder consultation or environmental documentation has been provided.', source: 'none', sourceDetail: 'Supply the stakeholder consultation record and any environmental impact assessment.' }]
    ),
  },
};

export async function seedWorkedExample() {
  const tenant: any = await TenantModel.findOne({ slug: process.env['TENANT_DEFAULT_SLUG'] || 'tenant-zero' });
  if (!tenant) { console.log('No default tenant — run the tenant seed first.'); return; }
  const tenantId = String(tenant._id);

  const existing = await ProjectModel.findOne({ name: PROJECT_NAME, tenantId });
  if (existing) { console.log(`Skipping worked example — '${PROJECT_NAME}' already present.`); return; }

  const methodology: any = await MethodologyModel.findOne({ code: 'VMR0017' });
  if (!methodology) { console.log('VMR0017 not seeded — run the methodology seed first.'); return; }

  const project: any = await ProjectModel.create({
    tenantId, name: PROJECT_NAME, sector: 'ENERGY',
    proponentOrgId: 'example-org', createdByUserId: 'example-user',
    methodologyId: methodology._id, intake: INTAKE,
    status: 'CASE_DRAFT_READY', attachments: [],
  });

  const sourceIds: any[] = [];
  for (const s of SOURCES) {
    const doc: any = await SourceDocumentModel.create({
      tenantId, projectId: project._id, filename: s.filename,
      storageRef: `example/${s.filename}`, mimeType: 'application/pdf',
      sizeBytes: s.extractedText.length, uploadedByUserId: 'example-user',
      extractedText: s.extractedText, linkedSections: [], status: 'processed',
    });
    sourceIds.push(doc._id);
  }

  const sections = (methodology.sectionGuidance || []).map((g: any) => {
    const authored = SECTIONS[g.section];
    return {
      key: g.section,
      status: authored ? 'draft_ready' : 'not_started',
      content: authored ? authored.content : undefined,
      warnings: authored?.warnings || [],
      sourceCitations: [],
      generationHistory: [],
      lastError: null,
    };
  });

  const caseDoc: any = await CaseDocumentModel.create({ tenantId, projectId: project._id, sections });
  await ProjectModel.updateOne({ _id: project._id }, { $set: { caseDocumentId: caseDoc._id, attachments: sourceIds } });

  const drafted = sections.filter((s: any) => s.status === 'draft_ready').length;
  console.log(`Seeded worked example '${PROJECT_NAME}': ${drafted}/${sections.length} sections analysed, ${SOURCES.length} evidence documents.`);
}

if (require.main === module) {
  (async () => {
    new MongoConnection();
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
    await seedWorkedExample();
    await mongoose.connection.close();
    process.exit(0);
  })().catch((err) => { console.error(err); process.exit(1); });
}
