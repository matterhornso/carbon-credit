import { IApplicabilityCondition } from "../../../domain/methodology/methodologyInterface";

export interface IApplicabilityResult {
  key: string;
  statement: string;
  result: string; // 'pass' | 'fail' | 'needs_review'
  guidance?: string;
}

const OPERATORS: Record<string, (inputValue: any, expected: string) => boolean> = {
  eq: (inputValue, expected) => String(inputValue) === expected,
  neq: (inputValue, expected) => String(inputValue) !== expected,
  gt: (inputValue, expected) => Number(inputValue) > Number(expected),
  gte: (inputValue, expected) => Number(inputValue) >= Number(expected),
  lt: (inputValue, expected) => Number(inputValue) < Number(expected),
  lte: (inputValue, expected) => Number(inputValue) <= Number(expected),
  in: (inputValue, expected) => expected.split(',').includes(String(inputValue)),
};

// Conditions with no operator (or operator 'manual_review') can't be
// auto-decided — e.g. VMR0017's technology/capacity/geography matrix. They
// come back 'needs_review' rather than silently passing or failing, so the
// UI can route them to human judgment instead of hiding them.
export function evaluateApplicability(
  conditions: IApplicabilityCondition[],
  intake: Record<string, any>
): { results: IApplicabilityResult[]; eligible: boolean } {
  const results: IApplicabilityResult[] = (conditions || []).map((condition) => {
    const comparator = condition.operator ? OPERATORS[condition.operator] : undefined;
    if (!condition.checksInputKey || !comparator) {
      return { key: condition.key, statement: condition.statement, result: 'needs_review', guidance: condition.guidance };
    }
    const inputValue = intake?.[condition.checksInputKey];
    if (inputValue === undefined || inputValue === null || inputValue === '') {
      return { key: condition.key, statement: condition.statement, result: 'needs_review', guidance: 'Required input not yet supplied.' };
    }
    const pass = comparator(inputValue, condition.value as string);
    return { key: condition.key, statement: condition.statement, result: pass ? 'pass' : 'fail', guidance: pass ? undefined : condition.guidance };
  });
  const eligible = results.every((result) => result.result !== 'fail');
  return { results, eligible };
}
