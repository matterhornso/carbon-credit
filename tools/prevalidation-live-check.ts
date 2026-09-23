/**
 * Live check: run the pre-validation pass against the real model.
 *
 * The point is NOT to read the findings and judge whether they sound good.
 * That grades on plausibility, which is the exact failure this pass exists to
 * catch in others. Instead the section under review carries PLANTED defects
 * with known ground truth, plus deliberately sound content, so the run yields
 * recall (did it find the real ones), precision (did it invent any), and a
 * mechanically-checkable verbatim-quoting result.
 */
import { LLMService } from '../src/interfaces/services/LLM.service';
import { buildPreValidationPrompt, parseFindings, IRawFinding } from '../src/application/usecases/prevalidation/PreValidationPrompt';
import { VM0047_CENSUS_BASED } from '../src/infrastructure/database/seed/methodology.seed';

const PROJECT: any = {
  _id: 'live-check-project',
  name: 'Kolar District Smallholder Agroforestry',
  intake: {
    activityType: 'direct_planting',
    preExistingWoodyBiomassCoverPercent: 4,
    landUseHistoryEligible: true,
    preProjectLandUseContinues: true,
    plantingDensityPerHectare: 45,
    recentSimilarWoodyBiomassRemoved: false,
    projectAreaHectares: 1240,
    hostCountry: 'India',
    projectStartDate: '2026-04-01',
    creditingPeriodYears: 20,
  },
};

// --- The section under review -------------------------------------------------
// Planted defects are marked D1..D5 in GROUND_TRUTH below. Sound statements are
// marked S1..S3 and must NOT attract a finding for the reason given.
const SECTION_UNDER_REVIEW = `## 3. Demonstration of Additionality

The project demonstrates additionality through the three mandatory tiers required by VT0008.

### 3.1 Regulatory Surplus

Neither the Karnataka Agroforestry Policy 2023 nor the National Agroforestry Policy 2014 mandates tree planting on private agricultural holdings of the class represented in the project area (both policy documents uploaded as Annex 3). No state or central regulation requires the planting activity proposed here. A letter from the State Forest Department confirming the absence of any such mandate will be provided during validation.

### 3.2 Investment Analysis

Per VT0008, a simple cost-benefit analysis was performed. The project requires an up-front investment of INR 4.8 crore, against which the benchmark IRR of 11.4% is taken from the Reserve Bank of India's weighted average lending rate for agriculture and allied activities, FY2024-25 (Annex 5). Without carbon revenue the project returns 6.1%, below the benchmark, and is therefore financially unattractive to a rational investor.

No sensitivity analysis has yet been performed; this is required by VT0008 and is flagged as an outstanding item for the project proponent.

### 3.3 Common Practice

Common practice analysis indicates an adoption rate of 4.2% among comparable smallholder operations in the Kolar and Chikkaballapur districts, which is well below the threshold at which an activity would be considered common practice in the region.

### 3.4 Project Activity

The project applies assisted natural regeneration across the degraded parcels within the project area, supplemented by direct planting where natural regeneration is insufficient. Establishment proceeds at a planting density of 68 units per hectare, which the proponent considers appropriate to local soil conditions.

The activity is implemented across the 1,780-hectare project area described in Section 2.`;

const OTHER_SECTIONS: any[] = [
  {
    key: 'project_boundary',
    status: 'finalized',
    content: `## 2. Project Boundary\n\nThe project boundary comprises the geo-referenced project area of 1,240 hectares in Kolar and Chikkaballapur districts, Karnataka, India, containing the full planting-unit census. The area consists of 214 discrete land parcels held by 186 smallholder proponents. Carbon pools included: woody biomass only. Non-woody biomass, dead wood, litter and soil organic carbon are excluded by design under the census-based approach.`,
  },
  {
    key: 'baseline_scenario',
    status: 'finalized',
    content: `## 4. Baseline Scenario\n\nUnder the census-based approach of VM0047, the baseline is zero by assumption, contingent on the eligibility conditions being met: pre-existing woody biomass cover below 10% (measured at 4%), continuous prior land use maintained, and planting density within the methodology cap. No counterfactual land-use trajectory is modelled, consistent with the methodology.`,
  },
];

const SECTION: any = { key: 'additionality', status: 'finalized', content: SECTION_UNDER_REVIEW };

// --- Ground truth -------------------------------------------------------------
const GROUND_TRUTH = [
  { id: 'D1', hint: /4\.2\s*%|adoption rate|common practice/i,
    what: 'Common-practice adoption rate of 4.2% asserted with NO cited source (guidance forbids <15% unsourced)' },
  { id: 'D2', hint: /1,?780|1,?240|hectare|project area/i,
    what: 'Area stated as 1,780 ha here, but 1,240 ha in project_boundary AND in intake (cross-section contradiction)' },
  { id: 'D3', hint: /letter|State Forest Department|will be provided|during validation/i,
    what: 'Evidence deferred: forest-department letter "will be provided during validation"' },
  { id: 'D4', hint: /assisted natural regeneration|ANR/i,
    what: 'Claims assisted natural regeneration — explicitly INELIGIBLE under the census-based applicability condition' },
  { id: 'D5', hint: /68\s*(units|planting)|density/i,
    what: 'Planting density 68/ha breaches the 50/ha cap AND contradicts intake value of 45' },
];

const SOUND = [
  { id: 'S1', what: 'Regulatory surplus cites two named policy documents (Annex 3) — properly sourced' },
  { id: 'S2', what: 'Benchmark IRR 11.4% attributed to a named RBI series (Annex 5) — properly sourced' },
  { id: 'S3', what: 'Missing sensitivity analysis is self-flagged as outstanding (ambiguous: an auditor may legitimately still raise it)' },
];

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

const PROMPT_FILE = process.env['PV_PROMPT_FILE'] || '/tmp/pv-prompt.json';

function buildMessages() {
  return buildPreValidationPrompt({
    methodology: VM0047_CENSUS_BASED,
    project: PROJECT,
    section: SECTION,
    guidance: (VM0047_CENSUS_BASED.sectionGuidance || []).find((g: any) => g.section === 'additionality'),
    otherSections: OTHER_SECTIONS,
  });
}

function score(raw: { findings?: IRawFinding[] }, label: string) {
  const rawCount = Array.isArray(raw?.findings) ? raw.findings!.length : -1;
  const { findings: parsed, dropped } = parseFindings(raw, {
    projectId: 'live-check-project', sectionKey: 'additionality',
    methodologyCode: VM0047_CENSUS_BASED.code, raisedByUserId: 'live-check',
  });

  console.log(`\n=== PARSE INTEGRITY (${label}) ===`);
  console.log(`raw findings returned : ${rawCount}`);
  console.log(`survived parseFindings: ${parsed.length}`);
  console.log(`dropped               : ${dropped.length}`);
  dropped.forEach((d: any) => console.log(`    - ${d.reason} :: ${d.claim.slice(0, 60)}`));

  console.log('\n=== VERBATIM DISCIPLINE (mechanical) ===');
  const body = norm(SECTION_UNDER_REVIEW);
  let verbatim = 0;
  parsed.forEach((f: any, i: number) => {
    const ok = f.claim && body.includes(norm(f.claim));
    if (ok) verbatim++;
    console.log(`  [${i + 1}] ${ok ? 'QUOTED  ' : 'NOT FOUND'} :: ${String(f.claim).slice(0, 88)}`);
  });
  console.log(`  -> ${verbatim}/${parsed.length} claims are verbatim substrings of the section`);

  console.log('\n=== RECALL vs PLANTED DEFECTS ===');
  const blob = parsed.map((f: any) => `${f.claim} ${f.issue} ${f.remediation}`).join(' \n ');
  let caught = 0;
  for (const d of GROUND_TRUTH) {
    const hit = d.hint.test(blob);
    if (hit) caught++;
    console.log(`  ${d.id} ${hit ? 'CAUGHT' : 'MISSED'} :: ${d.what}`);
  }
  console.log(`  -> ${caught}/${GROUND_TRUTH.length} planted defects surfaced`);

  console.log('\n=== SEVERITY / CATEGORY SPREAD ===');
  const by = (k: string) => parsed.reduce((a: any, f: any) => (a[f[k]] = (a[f[k]] || 0) + 1, a), {});
  console.log('  severity  :', JSON.stringify(by('severity')));
  console.log('  category  :', JSON.stringify(by('category')));

  console.log('\n=== FINDINGS AS PERSISTED ===');
  parsed.forEach((f: any, i: number) => {
    console.log(`\n[${i + 1}] ${String(f.severity).toUpperCase()} / ${f.category}`);
    console.log(`  claim      : ${f.claim}`);
    console.log(`  issue      : ${f.issue}`);
    console.log(`  remediation: ${f.remediation}`);
  });
  return parsed;
}

async function main() {
  const mode = process.argv[2] || 'live';

  if (mode === 'dump') {
    const messages = buildMessages();
    require('fs').writeFileSync(PROMPT_FILE, JSON.stringify(messages, null, 2));
    console.log(`prompt written to ${PROMPT_FILE}`);
    console.log(`system: ${messages[0].content.length} chars | user: ${messages[1].content.length} chars`);
    return;
  }

  if (mode === 'score') {
    const file = process.argv[3];
    if (!file) { console.error('usage: score <response.json>'); process.exit(1); }
    const raw = JSON.parse(require('fs').readFileSync(file, 'utf8'));
    score(raw, file);
    return;
  }

  const t0 = Date.now();
  const messages = buildMessages();
  console.log(`system: ${messages[0].content.length} chars | user: ${messages[1].content.length} chars`);
  const llm = new LLMService();
  let raw: { findings?: IRawFinding[] };
  try {
    raw = await llm.structuredCompletion<{ findings: IRawFinding[] }>(messages, { temperature: 0.1 });
  } catch (e: any) {
    console.error('LLM CALL FAILED:', e?.message || e);
    process.exit(1);
  }
  console.log(`\n=== RAW RESPONSE (${((Date.now() - t0) / 1000).toFixed(1)}s) ===`);
  console.log(JSON.stringify(raw, null, 2));
  score(raw, 'live');
}

main().catch((e) => { console.error(e); process.exit(1); });
