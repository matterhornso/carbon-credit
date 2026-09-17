import { IRegistryInterface } from '../../../domain/registry/registryInterface';
import { REGISTRIES } from '../../../infrastructure/database/seed/registry.seed';
import { IMethodologyInterface } from '../../../domain/methodology/methodologyInterface';

/**
 * Where a registry definition comes from.
 *
 * Deliberately a code-resident catalogue rather than a Mongo collection, for
 * now. A registry template is not tenant data and not customer-editable: it is
 * a transcription of a published standard, it changes when the standard
 * changes, and a wrong one silently produces documents that fail validation.
 * Code review and the test suite are better controls for that than a database
 * row nobody diffs. Methodologies live in Mongo because customers will
 * eventually add their own; registries will move there when the same is true of
 * them, and this module is the seam that makes that a one-file change.
 */

const BY_CODE = new Map<string, IRegistryInterface>(
  REGISTRIES.map((registry) => [String(registry.code).toUpperCase(), registry])
);

export function listRegistries(): IRegistryInterface[] {
  return REGISTRIES;
}

export function findRegistry(code: string | undefined): IRegistryInterface | undefined {
  if (!code) return undefined;
  return BY_CODE.get(String(code).toUpperCase());
}

/**
 * The registry a methodology belongs to.
 *
 * Reads `registryCode` when present, falling back to the legacy `standard`
 * field, which already held exactly this ("VCS") without being modelled as
 * anything. Returning undefined is a supported outcome, not a failure: the
 * resolver's no-registry path reproduces the pre-registry behaviour, so a
 * methodology naming a registry nobody has transcribed yet still originates —
 * it just does not get registry-level guidance.
 */
export function registryForMethodology(methodology: IMethodologyInterface): IRegistryInterface | undefined {
  const declared = (methodology as any).registryCode as string | undefined;
  return findRegistry(declared || methodology.standard);
}
