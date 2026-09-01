// Seeds the two Phase 1 target methodologies. Admin-seeded reference data —
// there is deliberately no HTTP create endpoint (see MethodologyController).
// Run with: npx ts-node src/infrastructure/database/seed/methodology.seed.ts
//
// VM0047 is seeded using its CENSUS-BASED approach only, not area-based.
// Area-based relies on an annually-refreshed remote-sensing "dynamic
// performance benchmark" (matched control plots, satellite/LiDAR stocking
// index) — exactly the external data integration this phase's scoping
// decision defers. Census-based uses an assumption-based zero baseline and
// fits a user-supplied-data-only v1. See the approved plan, scoping
// decision 4, and Risk 3.
//
// Sources (primary, read in full 2026-08-20):
// - https://verra.org/methodologies/vm0047-afforestation-reforestation-and-revegetation-v1-1/
// - https://verra.org/methodologies/vmr0017-grid-connected-electricity-generation-from-renewable-sources-acm0002-revision-v1-0/
// One inherited fact — ACM0002 v22.0's combined-margin (OM/BM) mechanics,
// which VMR0017 leaves unchanged — could not be verified against the v22.0
// primary text directly (not retrievable at research time); treat as
// high-confidence secondary-source knowledge, not primary-verified.

import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, `../../../../env/${process.env.ENVIRONMENT || 'local'}.env`)
});

import mongoose from "mongoose";
import { MongoConnection } from "../MongoConnection";
import { Methodology as MethodologyDomain } from "../../../domain";
import { MethodologyUseCase } from "../../../application/usecases/index";
import { MethodologyRepository } from "../../../interfaces/database/MethodologyRepository";
import { MethodologyMongoConnection } from "../helper/database/Methodology";
import { IMethodologyInterface } from "../../../domain/methodology/methodologyInterface";

const VM0047_CENSUS_BASED: IMethodologyInterface = {
  code: "VM0047",
  version: "1.1",
  title: "Afforestation, Reforestation, and Revegetation (ARR) — Census-Based Approach",
  standard: "VCS",
  status: "active",
  sector: "AFOLU",
  sourceReference: {
    name: "VM0047: Afforestation, Reforestation, and Revegetation, v1.1",
    url: "https://verra.org/methodologies/vm0047-afforestation-reforestation-and-revegetation-v1-1/",
    publisher: "Verra",
  },
  applicabilityConditions: [
    {
      key: "activity_type",
      statement: "Project activity is direct planting (manual planting or broadcast seeding) of discrete, individually identifiable planting units. Assisted natural regeneration is not eligible under the census-based approach.",
      checksInputKey: "activityType", operator: "eq", value: "direct_planting",
    },
    {
      key: "pre_existing_woody_biomass",
      statement: "Pre-existing woody biomass cover on the project area must be below 10%.",
      checksInputKey: "preExistingWoodyBiomassCoverPercent", operator: "lt", value: "10",
    },
    {
      key: "land_use_history",
      statement: "The area must have been under continuous cropping (same crop, at most one fallow season, for at least 10 years before project start) or classified as IPCC 'settlements' or 'other lands'.",
      checksInputKey: "landUseHistoryEligible", operator: "eq", value: "true",
    },
    {
      key: "pre_project_land_use_continuity",
      statement: "The pre-project land use (e.g. agricultural production) must continue unchanged throughout the project lifetime.",
      checksInputKey: "preProjectLandUseContinues", operator: "eq", value: "true",
    },
    {
      key: "planting_density_cap",
      statement: "Planting density must not exceed 50 planting units per hectare, scaled proportionally to instance size.",
      checksInputKey: "plantingDensityPerHectare", operator: "lte", value: "50",
    },
    {
      key: "no_recent_woody_removal",
      statement: "Woody biomass serving a similar purpose to the planting units must not have been removed from the area within the last 10 years.",
      checksInputKey: "recentSimilarWoodyBiomassRemoved", operator: "eq", value: "false",
    },
    {
      key: "soil_disturbance_limit",
      statement: "Soil inversion (e.g. plowing) must not exceed 25 cm depth and may occur at most once during the crediting period.",
      checksInputKey: "soilInversionExceeds25cm", operator: "eq", value: "false",
      guidance: "Pit planting itself may exceed 25 cm depth — the limit applies to inversion (e.g. plowing), not planting holes.",
    },
  ],
  requiredInputs: [
    { key: "activityType", label: "Planting activity type", dataType: "select", options: ["direct_planting"], required: true, helpText: "Census-based VM0047 covers direct planting only — assisted natural regeneration requires the area-based approach, not modeled in this version." },
    { key: "projectArea", label: "Project area", dataType: "number", unit: "hectares", required: true },
    { key: "plantingUnitCensus", label: "Planting unit census", dataType: "file", required: true, helpText: "A complete census establishing N, the total number of planting units, at project start — unique ID, geo-referenced location, planting year, and species per unit." },
    { key: "plantingDensityPerHectare", label: "Planting density", dataType: "number", unit: "units/ha", required: true },
    { key: "preExistingWoodyBiomassCoverPercent", label: "Pre-existing woody biomass cover", dataType: "number", unit: "%", required: true },
    { key: "landUseHistoryEligible", label: "Land-use history meets continuous-cropping / settlements / other-lands criteria", dataType: "boolean", required: true },
    { key: "preProjectLandUseContinues", label: "Pre-project land use will continue unchanged", dataType: "boolean", required: true },
    { key: "recentSimilarWoodyBiomassRemoved", label: "Similar-purpose woody biomass removed in the last 10 years", dataType: "boolean", required: true },
    { key: "soilInversionExceeds25cm", label: "Soil inversion will exceed 25 cm depth", dataType: "boolean", required: true },
    { key: "species", label: "Species planted", dataType: "multiselect", required: true },
    { key: "projectStartDate", label: "Project start date (date of the complete planting-unit census)", dataType: "date", required: true },
    { key: "creditingPeriodYears", label: "Crediting period length", dataType: "number", unit: "years", required: true },
    { key: "fertilizerUse", label: "Synthetic or organic fertilizer applied", dataType: "boolean", required: false },
  ],
  additionalityTiers: [
    { tier: "2a", name: "Regulatory surplus", description: "Demonstrate the project activity is not required by any applicable law, statute, or regulatory framework.", requiredEvidence: ["Applicable regulation review", "Legal citation or opinion"] },
    { tier: "4a", name: "Investment analysis", description: "Apply VCS Tool VT0008 Step 3 (benchmark or investment-comparison analysis) to show the project is not the most financially attractive option absent carbon revenue.", requiredEvidence: ["Financial model", "Benchmark rate or comparison-alternative analysis per VT0008"] },
    { tier: "3", name: "Common practice", description: "Survey a representative sample of similar landowners not receiving carbon finance within the same geographic domain. The activity is additional only if cumulative adoption among them is below 15%.", requiredEvidence: ["Landowner survey, or equivalent published data (agricultural census, peer-reviewed literature, industry-association reports)", "Adoption-rate calculation with source"] },
  ],
  baselineFormula: {
    description: "Census-based VM0047 assumes a zero baseline: absent the project, the planting units would not exist, so baseline carbon stock change is zero once eligibility conditions hold. Net removals equal the project's own measured woody biomass carbon stock change, discounted for uncertainty, minus project emissions. No separate baseline land-use trajectory is modeled.",
    variables: [
      { name: "deltaC_WP_t", label: "Project aboveground + belowground woody biomass carbon stock change at time t", source: "derived", sourceRef: "Field/plot sampling of the planting-unit census, species-specific allometric equations", unit: "tCO2e" },
      { name: "UNC_t", label: "Uncertainty deduction on the carbon stock estimate", source: "derived", unit: "%" },
      { name: "PE_t", label: "Project emissions (biomass burning CH4/N2O + fertilizer N2O)", source: "derived", unit: "tCO2e" },
      { name: "M_t", label: "Planting-unit mortality rate", source: "input", unit: "%" },
    ],
    relationship: "CR_t = (deltaC_WP,t x (1 - UNC_t)) - (deltaC_WP,t-x x (1 - UNC_t-x)) - PE_t. Baseline and leakage are zero by assumption under the census-based approach (pre-project land use is required to continue, so no activity displacement).",
  },
  monitoringParameters: [
    { parameter: "Planting units sampled (n_t)", unit: "count", frequency: "Every 5 years or more frequently", method: "Stratified sampling of the full planting-unit census" },
    { parameter: "Mortality rate (M_t)", unit: "%", frequency: "Every 5 years or more frequently", method: "Field survey of sampled planting units; unlocatable units conservatively assumed dead" },
    { parameter: "Per-planting-unit woody biomass", unit: "tC/unit", frequency: "Every 5 years or more frequently", method: "Species-specific allometric equations from field-measured diameter/height" },
    { parameter: "Area burned", unit: "ha", frequency: "Every 5 years or more frequently", method: "GIS / remote imagery" },
    { parameter: "Fertilizer mass applied (synthetic/organic)", unit: "kg", frequency: "At least every 5 years, or before each verification if applied more frequently", method: "Application records" },
  ],
  sectionGuidance: [
    { section: "project_description", contentType: "narrative", promptFragment: "Describe an afforestation/reforestation/revegetation project using VM0047's census-based approach: direct planting of discrete, individually identifiable units on land with under 10% pre-existing woody biomass cover and a qualifying land-use history. Reference the specific project area, species, and planting density from the intake data." },
    { section: "crediting", contentType: "structured", promptFragment: "State the crediting period length and start date from intake. Note the project start date is defined as the date of the complete planting-unit census establishing N (total planting units)." },
    { section: "safeguards", contentType: "narrative", promptFragment: "Draft safeguards content generically from any stakeholder-consultation or environmental-risk documents supplied — VM0047 does not impose land-use-planning-specific safeguards beyond the general VCS requirements, so do not assert methodology-specific safeguard rules not present in the source material." },
    { section: "methodology_application", contentType: "narrative", promptFragment: "Explain why the census-based approach (not area-based) applies: pre-project land use continues, planting density is at or below 50 units/ha, pre-existing woody biomass cover is under 10%, and units are individually identifiable via GPS points or durable physical markers." },
    { section: "additionality", contentType: "structured", promptFragment: "For each additionality tier (regulatory surplus, investment analysis per VT0008, common practice), draft the argument using evidence from intake and uploaded documents only. Do not assert a common-practice adoption rate below 15% without a cited source — flag as needing evidence if none was supplied." },
    { section: "baseline_scenario", contentType: "narrative", promptFragment: "State plainly that the baseline is zero by assumption under the census-based approach, contingent on the eligibility conditions (pre-existing biomass under 10%, continuous prior land use, density cap). Do not invent a counterfactual land-use trajectory — VM0047's census-based approach does not model one." },
    { section: "project_boundary", contentType: "structured", promptFragment: "Describe the project boundary as the geo-referenced project area containing the planting-unit census, citing the area figure and any discrete land parcels from intake." },
    { section: "quantification", contentType: "structured", promptFragment: "Present the CR_t formula from this methodology's baseline/quantification definition, populated with this project's specific carbon pools (woody biomass only — non-woody biomass, dead wood, litter, and soil organic carbon are excluded by design under census-based VM0047)." },
    { section: "data_quality_management", contentType: "narrative", promptFragment: "Describe QA/QC procedures for the planting-unit census and field sampling — data collection protocol, sampling design, and how unlocatable units are handled (conservatively assumed dead)." },
    { section: "monitoring", contentType: "structured", promptFragment: "List the monitoring parameters and frequencies from this methodology's Data and Parameters Monitored set, scaled to this project's planting-unit census." },
  ],
};

const VMR0017_GRID_RENEWABLE: IMethodologyInterface = {
  code: "VMR0017",
  version: "1.0",
  title: "Grid-Connected Electricity Generation from Renewable Sources (ACM0002 Revision)",
  standard: "VCS",
  status: "active",
  sector: "ENERGY",
  sourceReference: {
    name: "VMR0017: Grid-Connected Electricity Generation from Renewable Sources (ACM0002 Revision), v1.0",
    url: "https://verra.org/methodologies/vmr0017-grid-connected-electricity-generation-from-renewable-sources-acm0002-revision-v1-0/",
    publisher: "Verra",
  },
  applicabilityConditions: [
    {
      key: "technology_geography",
      statement: "Wind, geothermal, and terrestrial solar PV are eligible in low, lower-middle, and upper-middle income countries (World Bank classification); floating solar, wave, and tidal are eligible globally; hydroelectric is eligible only in UN Least Developed Countries.",
      checksInputKey: "technologyType", operator: "manual_review",
      guidance: "Cross-check technology type, capacity, and host country against VMR0017 Table 1 before proceeding — this is a matrix condition, not a single comparison.",
    },
    {
      key: "grid_connection",
      statement: "The project must be a grid-connected electricity generation facility.",
      checksInputKey: "gridConnected", operator: "eq", value: "true",
    },
    {
      key: "hydro_capacity_cap",
      statement: "If the technology is hydroelectric, rated or authorized capacity (whichever is higher) must not exceed 15 MW.",
      checksInputKey: "installedCapacityMW", operator: "manual_review",
      guidance: "Only enforced when technologyType = hydroelectric.",
    },
    {
      key: "bess_colocation",
      statement: "If integrated with a Battery Energy Storage System, the BESS must be co-located with, directly connected to, share a common grid connection point with, be commonly owned/operated with, and be part of the same investment decision as the power plant.",
      checksInputKey: "bessIntegrated", operator: "manual_review",
      guidance: "Only applies when bessIntegrated = true.",
    },
  ],
  requiredInputs: [
    { key: "technologyType", label: "Renewable technology", dataType: "select", options: ["wind_onshore", "wind_offshore", "geothermal", "solar_pv_terrestrial", "solar_pv_floating", "wave", "tidal", "hydroelectric"], required: true },
    { key: "installedCapacityMW", label: "Installed / rated / authorized capacity", dataType: "number", unit: "MW", required: true },
    { key: "hostCountry", label: "Host country", dataType: "string", required: true },
    { key: "gridConnected", label: "Grid-connected", dataType: "boolean", required: true },
    { key: "commissioningDate", label: "Commissioning / project start date", dataType: "date", required: true },
    { key: "expectedAnnualGeneration", label: "Expected net annual electricity generation delivered to grid", dataType: "number", unit: "MWh/yr", required: true },
    { key: "projectType", label: "Project type", dataType: "select", options: ["greenfield", "capacity_addition", "retrofit_rehabilitation_replacement"], required: true },
    { key: "bessIntegrated", label: "Integrated with a Battery Energy Storage System", dataType: "boolean", required: false },
    { key: "bessFireSuppressionAgent", label: "BESS fire suppression agent type", dataType: "string", required: false, helpText: "Needed to source the agent's GWP for the project-emissions calculation. Low/zero-GWP agents (e.g. Novec 1230) are encouraged." },
    { key: "gridEmissionFactorOption", label: "Grid emission factor calculation option", dataType: "select", options: ["ex_ante", "ex_post"], required: true, helpText: "Per VT0011 — must be fixed and recorded in project documents, cannot be switched mid-crediting-period." },
    { key: "creditingPeriodYears", label: "Crediting period length", dataType: "number", unit: "years", required: true },
  ],
  additionalityTiers: [
    { tier: "2a", name: "Regulatory surplus", description: "Demonstrate the project is not required by any applicable law, statute, or regulation.", requiredEvidence: ["Applicable regulation review"] },
    { tier: "4a", name: "Investment analysis", description: "Apply VT0008 Step 3 investment-comparison or benchmark analysis. VMR0017 explicitly removes both the CDM positive-list route (TOOL32, inactivated 2025-10-01) and barrier analysis (VT0008 Step 2) — investment analysis is mandatory, not one option among several.", requiredEvidence: ["Financial model", "Benchmark rate or investment-comparison analysis per VT0008 Step 3"] },
    { tier: "3", name: "Common practice", description: "Apply VT0008 Step 4 common practice analysis for the relevant technology and geography.", requiredEvidence: ["Common practice analysis per VT0008 Step 4"] },
  ],
  baselineFormula: {
    description: "Baseline emissions are unchanged from ACM0002 v22.0: the grid emission factor is a generation-weighted combined margin (operating margin + build margin), now calculated via VT0011 instead of the retired TOOL07. VMR0017 does not alter the calculation itself, only which tool computes it, and adds an explicit ex-ante/ex-post choice.",
    variables: [
      { name: "BE_y", label: "Baseline emissions in year y", source: "derived", sourceRef: "VT0011 grid emission factor x net generation", unit: "tCO2e" },
      { name: "EF_grid_CM_y", label: "Combined-margin grid emission factor", source: "reference", sourceRef: "VT0011 Electricity System Emission Factors (operating margin + build margin, default 50/50 weighting)", unit: "tCO2/MWh" },
      { name: "EG_facility_y", label: "Net electricity generation delivered to the grid", source: "input", unit: "MWh/yr" },
      { name: "EF_embodied", label: "Technology-specific life-cycle embodied emission factor", source: "reference", sourceRef: "NREL Life Cycle GHG Emissions from Electricity Generation (Sept 2021) — e.g. solar PV 43, wind 13, hydropower 21 gCO2e/kWh", unit: "gCO2e/kWh" },
    ],
    relationship: "ER_y = BE_y - PE_y - LE_y, where PE_y = PE_FF,y + PE_GP,y + PE_HP,y + PE_BESS,y + PE_PSP,y + PE_FSS,y (fossil-fuel, geothermal, hydro-reservoir, BESS/PSP grid-charging, and fire-suppression-agent-release emissions — include only the terms applicable to this project's technology), and LE_y = EG_facility,y x EF_embodied x 1e-3 (life-cycle embodied emissions as a leakage proxy, not a traditional activity-shifting leakage term).",
  },
  monitoringParameters: [
    { parameter: "Net electricity generation delivered to grid (EG_facility,y)", unit: "MWh/yr", frequency: "Continuous measurement, aggregated at least monthly", method: "Grid-interface electricity meters" },
    { parameter: "BESS fire suppression agent mass released per event", unit: "tonnes", frequency: "Continuous monitoring of all events, aggregated at least monthly", method: "Calibrated weighing before/after each event; full charge mass conservatively assumed if actual quantity can't be reliably determined" },
  ],
  sectionGuidance: [
    { section: "project_description", contentType: "narrative", promptFragment: "Describe a grid-connected renewable electricity generation project under VMR0017 (an ACM0002 revision). State technology type, capacity, host country, and confirm eligibility against VMR0017 Table 1 (technology/capacity/geography matrix)." },
    { section: "crediting", contentType: "structured", promptFragment: "State the crediting period length and commissioning/start date from intake." },
    { section: "safeguards", contentType: "narrative", promptFragment: "Draft safeguards content generically from any environmental/stakeholder documents supplied — VMR0017 does not add technology-specific safeguard requirements beyond general VCS rules, so do not assert methodology-specific safeguard rules not present in the source material." },
    { section: "methodology_application", contentType: "narrative", promptFragment: "State that VMR0017 must be applied together with ACM0002 v22.0, noting which ACM0002 procedures are replaced (TOOL01->VT0008, TOOL02->VT0009, TOOL05->VT0010, TOOL07->VT0011) versus left unchanged (TOOL03 fossil-fuel emissions; the baseline-emissions calculation itself)." },
    { section: "additionality", contentType: "structured", promptFragment: "Draft the additionality case using the three mandatory VT0008 steps: regulatory surplus, investment analysis, and common practice. Explicitly note that barrier analysis and the CDM positive list are not applicable under VMR0017 — do not draft a barrier-analysis argument." },
    { section: "baseline_scenario", contentType: "narrative", promptFragment: "Describe the combined-margin grid emission factor approach (operating margin + build margin) per VT0011, and state which ex-ante/ex-post option was selected and why." },
    { section: "project_boundary", contentType: "structured", promptFragment: "Describe the project boundary as the generation facility and its grid interconnection point, per ACM0002's unchanged project-boundary definition (no changes under VMR0017)." },
    { section: "quantification", contentType: "structured", promptFragment: "Show ER_y = BE_y - PE_y - LE_y with this project's specific project-emission terms (include only PE_GP/PE_HP/PE_BESS/PE_PSP/PE_FSS if applicable to this technology) and the embodied-emissions leakage term using the technology-specific EF_embodied default." },
    { section: "data_quality_management", contentType: "narrative", promptFragment: "Describe metering QA/QC — calibration schedule for grid-interface meters and, if BESS-integrated, for fire-suppression-agent weighing equipment." },
    { section: "monitoring", contentType: "structured", promptFragment: "List monitoring parameters: net generation (continuous, monthly aggregation via grid meters) and, if BESS-integrated, fire-suppression agent release monitoring." },
  ],
};

async function seedIfMissing(useCase: MethodologyUseCase, data: IMethodologyInterface) {
  const existing = await useCase.getMethodologyByCode(data.code as string);
  if (existing) {
    console.log(`Skipping ${data.code} v${data.version} — already seeded.`);
    return;
  }
  const created = await new MethodologyDomain().create(data, useCase);
  console.log(`Seeded ${data.code} v${data.version}.`);
  return created;
}

async function run() {
  new MongoConnection();
  await new Promise((resolve) => mongoose.connection.once('open', resolve));

  const useCase = new MethodologyUseCase(new MethodologyRepository(new MethodologyMongoConnection()));
  await seedIfMissing(useCase, VM0047_CENSUS_BASED);
  await seedIfMissing(useCase, VMR0017_GRID_RENEWABLE);

  await mongoose.connection.close();
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { VM0047_CENSUS_BASED, VMR0017_GRID_RENEWABLE };
