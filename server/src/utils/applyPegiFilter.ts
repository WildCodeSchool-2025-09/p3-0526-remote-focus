import userRepository from "../modules/user/userRepository";

export const PEGI16_VALUES = ["16", "18"];

export function pegiFilterClause(alias = "m"): string {
  return `(? = FALSE OR ${alias}.pegi IS NULL OR ${alias}.pegi NOT IN (?))`;
}

export function isPegiRestricted(pegi: string | null): boolean {
  return pegi != null && (PEGI16_VALUES as string[]).includes(pegi);
}

export async function resolveHidePegi16(
  userId: number | undefined,
): Promise<boolean> {
  return userId != null ? userRepository.readIsPegi16(userId) : false;
}
