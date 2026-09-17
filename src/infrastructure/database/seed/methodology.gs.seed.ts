import { IMethodologyInterface } from "../../../domain/methodology/methodologyInterface";

/**
 * A Gold Standard methodology, seeded to prove the cross-registry claim end to
 * end rather than only in the resolver's unit tests.
 *
 * It is a third structural shape as well as a second registry: household
 * cooking energy, where the unit of accounting is a distributed device rather
 * than a hectare or a megawatt, the baseline turns on a national fraction of
 * non-renewable biomass rather than a grid emission factor or a zero
 * assumption, and usage must be demonstrated rather than assumed because a
 * stove that was distributed is not a stove that is used.
 *
 * PROVENANCE - read this before relying on the numbers.
 * ----------------------------------------------------
 * Unlike the VM0047 and VMR0017 seeds, which were transcribed from the
 * published methodology texts read in full, this seed was drafted from domain
 * knowledge of the Gold Standard cookstove methodologies and has NOT been
 * checked line by line against the published document. The structure - what
 * kind of inputs, what kind of applicability conditions, what the baseline
 * turns on - is sound and is what the registry layer is being tested against.
 * The specific thresholds, default values and parameter names must be verified
 * against the current published methodology before any real project is
 * originated on it. `status` is therefore 'draft', not 'active', so it does not
 * present itself to a customer as ready.
 *
 * Saying this in the file rather than in a commit message is deliberate: the
 * next person to read this seed is the one who needs to know.
 */
const GS_METERED_COOKING: IMethodologyInterface = {
  code: "GS-MMECD",
  version: "1.0-draft",
  title: "Metered and Measured Energy Cooking Devices",
  standard: "GS",
  status: "draft",
  sector: "ENERGY_DEMAND",
  sourceReference: {
    name: "Gold Standard: Metered & Measured Energy Cooking Devices (structure transcribed from domain knowledge; NOT primary-verified)",
    url: "https://globalgoals.goldstandard.org/",
    publisher: "Gold Standard Foundation",
  },
  applicabilityConditions: [
    {
      key: "device_metering",
      statement: "Each device records or transmits usage data sufficient to establish actual energy delivered, rather than relying on a survey of claimed use.",
      checksInputKey: "meteringInPlace",
      operator: "eq",
      value: "true",
      guidance: "This is the condition that separates this methodology from survey-based cookstove methodologies, and the one most often failed. A distribution record is not a usage record.",
    },
    {
      key: "displaces_nonrenewable",
      statement: "The device displaces a baseline fuel that is at least partly non-renewable biomass, or a fossil cooking fuel.",
      checksInputKey: "baselineFuel",
      operator: "in",
      value: "wood,charcoal,kerosene,lpg,coal",
    },
    {
      key: "fnrb_source",
      statement: "A defensible fraction of non-renewable biomass (fNRB) is available for the host country or region.",
      operator: "manual_review",
      guidance: "fNRB drives the entire result and is the most contested parameter in cookstove crediting. Requires a current CDM/host-country default or a project-specific study; a value carried over from an older vintage is a finding waiting to happen.",
    },
    {
      key: "no_double_counting",
      statement: "The devices are not already credited under another programme, and the host country's authorisation position is documented.",
      operator: "manual_review",
      guidance: "Household device programmes are the highest-risk category for double issuance because devices move and programmes overlap geographically.",
    },
    {
      key: "stakeholder_consultation_done",
      statement: "A Gold Standard stakeholder consultation round has been held and documented.",
      checksInputKey: "stakeholderConsultationHeld",
      operator: "eq",
      value: "true",
      guidance: "Gold Standard requires a documented consultation before validation. This has no VCS equivalent, which is exactly why it is modelled at the registry level as well as here.",
    },
  ],
  requiredInputs: [
    { key: "deviceType", label: "Cooking device type", dataType: "select", options: ["improved_biomass_stove", "electric_induction", "electric_pressure_cooker", "lpg_stove", "ethanol_stove", "solar_electric_cooker"], required: true },
    { key: "deviceCount", label: "Number of devices deployed", dataType: "number", unit: "devices", required: true },
    { key: "hostCountry", label: "Host country", dataType: "string", required: true },
    { key: "baselineFuel", label: "Baseline cooking fuel displaced", dataType: "select", options: ["wood", "charcoal", "kerosene", "lpg", "coal"], required: true },
    { key: "meteringInPlace", label: "Devices record or transmit actual usage data", dataType: "boolean", required: true, helpText: "Metered usage is what this methodology is built on. Without it, a survey-based methodology applies instead." },
    { key: "fnrb", label: "Fraction of non-renewable biomass (fNRB)", dataType: "number", unit: "fraction 0-1", required: true, helpText: "Use the current host-country default or a project-specific study. State which, with the source — this single parameter moves the result more than any other." },
    { key: "baselineFuelConsumptionPerHousehold", label: "Baseline fuel consumption per household", dataType: "number", unit: "kg/household/year", required: true },
    { key: "usageEvidence", label: "Usage/metering data export", dataType: "file", required: true, helpText: "The device-level record establishing actual use over the monitoring period." },
    { key: "stakeholderConsultationHeld", label: "Stakeholder consultation round held and documented", dataType: "boolean", required: true },
    { key: "stakeholderConsultationReport", label: "Stakeholder consultation report", dataType: "file", required: false, helpText: "Required by Gold Standard before validation. Upload it here if the consultation has already been held." },
    { key: "sdgsTargeted", label: "SDGs targeted (at least three, including SDG 13)", dataType: "multiselect", options: ["SDG 1", "SDG 3", "SDG 4", "SDG 5", "SDG 7", "SDG 8", "SDG 13", "SDG 15"], required: true, helpText: "Gold Standard certifies SDG impact alongside emission reductions. Cooking projects most commonly claim SDG 3 (household air quality), 5 (time burden borne by women), 7 (clean energy access) and 13." },
    { key: "projectStartDate", label: "Project start date", dataType: "date", required: true },
    { key: "creditingPeriodYears", label: "Crediting period length", dataType: "number", unit: "years", required: true },
  ],
  additionalityTiers: [
    { tier: "2a", name: "Regulatory surplus", description: "Show the deployment is not mandated by host-country law or regulation.", requiredEvidence: ["Applicable regulation review for the host country", "Legal citation"] },
    { tier: "3", name: "Barrier analysis", description: "Identify the barriers — upfront cost against household income, distribution reach, absence of a financing mechanism — that prevent the technology being adopted at scale without carbon finance.", requiredEvidence: ["Household affordability analysis", "Market penetration data for the device type in the host country"] },
    { tier: "4a", name: "Investment analysis", description: "Show the programme is not viable on device revenue alone at the price point households can bear.", requiredEvidence: ["Programme financial model", "Device unit economics including distribution and after-sales cost"] },
  ],
  baselineFormula: {
    description: "Emission reductions are the difference between the baseline fuel that would have been burned to deliver the cooking energy actually metered, and the project's own emissions, with the non-renewable share of biomass set by fNRB. Because usage is metered rather than assumed, the quantity that drives the result is energy actually delivered — a deployed device contributing nothing until it is used.",
    variables: [
      { name: "E_delivered", label: "Useful cooking energy delivered by project devices, from metered data", source: "input", sourceRef: "Device metering export", unit: "MJ" },
      { name: "eta_baseline", label: "Thermal efficiency of the baseline device", source: "derived", sourceRef: "Methodology default or measured", unit: "fraction" },
      { name: "eta_project", label: "Thermal efficiency of the project device", source: "derived", unit: "fraction" },
      { name: "fNRB", label: "Fraction of non-renewable biomass", source: "input", sourceRef: "Host-country default or project study", unit: "fraction" },
      { name: "NCV_baseline", label: "Net calorific value of the baseline fuel", source: "derived", unit: "MJ/kg" },
      { name: "EF_baseline", label: "Emission factor of the baseline fuel", source: "derived", unit: "tCO2e/TJ" },
      { name: "PE", label: "Project emissions (project fuel or electricity consumed)", source: "derived", unit: "tCO2e" },
    ],
    relationship: "ER = ((E_delivered / eta_baseline) x NCV_baseline x EF_baseline x fNRB) - PE. The fNRB term applies only to the biomass portion of the baseline; a fossil baseline fuel (LPG, kerosene) is fully counted and fNRB does not apply to it.",
  },
  monitoringParameters: [
    { parameter: "Metered device usage", unit: "MJ or cooking events", frequency: "Continuous, reported per verification period", method: "On-device metering, transmitted or physically collected" },
    { parameter: "Devices in operation", unit: "count", frequency: "Per verification period", method: "Metering telemetry cross-checked against distribution records; a device with no usage signal counts as not in operation" },
    { parameter: "fNRB", unit: "fraction", frequency: "Per crediting period, or on publication of a revised default", method: "Host-country default or project-specific study" },
    { parameter: "Project fuel or electricity consumption", unit: "kg or kWh", frequency: "Per verification period", method: "Metering or purchase records" },
    { parameter: "SDG indicators declared in the PDD", unit: "as declared", frequency: "Per verification period", method: "Survey or measurement per the indicator; Gold Standard verifies these alongside the emission reductions" },
  ],
  // No section list. The document's sections come from the Gold Standard
  // template in registry.seed.ts; this methodology supplies only what it has
  // something specific to say about, which is what the split is for. Note there
  // is no entry for sdg_contributions or stakeholder_consultation: those are GS
  // document sections, and they generate from the registry's own guidance.
  sectionOverlays: [
    { section: "project_description", promptFragment: "Describe a distributed household cooking-energy programme: the device type, the number deployed, the host country and the population served. State how devices are distributed and how usage is metered. Cite the device count and country from intake." },
    { section: "methodology_application", promptFragment: "Demonstrate that usage is metered rather than surveyed — this is the applicability condition that distinguishes this methodology — and that the baseline fuel is one the methodology covers. Address the fNRB source explicitly and name it." },
    { section: "additionality", promptFragment: "Argue barrier analysis first: upfront device cost against household income in the host country, and current market penetration of the device type. Do not assert a penetration figure without a cited source. Investment analysis should address programme-level economics including distribution and after-sales cost, not device bill-of-materials alone." },
    { section: "baseline_scenario", promptFragment: "The baseline is continued use of the displaced fuel to deliver the same cooking energy. Derive it from metered delivered energy and the baseline device efficiency, not from assumed household fuel use. State the fNRB value applied, its source, and that it applies only to the biomass portion of the baseline — a fossil baseline fuel is counted in full without it." },
    { section: "monitoring", promptFragment: "Centre the monitoring plan on device-level metering: what is recorded, how it reaches the project, and how a device that stops reporting is treated. A device with no usage signal must count as not in operation rather than being assumed to continue." },
    { section: "crediting", promptFragment: "State the crediting period start and length from intake, and check it against the Gold Standard limit rather than assuming the Verra one." },
  ],
} as IMethodologyInterface;

export { GS_METERED_COOKING };
