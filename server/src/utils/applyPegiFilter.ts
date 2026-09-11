export const PEGI16_VALUES = ["16", "18"];

export function pegiFilterClause(alias = "m"): string {
  return `(? = FALSE OR ${alias}.pegi IS NULL OR ${alias}.pegi NOT IN (?))`;
}
