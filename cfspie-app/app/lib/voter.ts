import { v4 as uuidv4 } from "uuid";

const VOTER_TOKEN_KEY = "spie_voter_token";

/**
 * Gets or creates a persistent anonymous voter token stored in localStorage.
 * This is used to prevent duplicate votes per category without requiring login.
 * One token = one person (best-effort, not cryptographically secure).
 */
export function getOrCreateVoterToken(): string {
  if (typeof window === "undefined") return "";

  let token = localStorage.getItem(VOTER_TOKEN_KEY);
  if (!token) {
    token = uuidv4();
    localStorage.setItem(VOTER_TOKEN_KEY, token);
  }
  return token;
}

export function getVoterToken() {
  let token = localStorage.getItem("voter_token")

  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem("voter_token", token)
  }

  return token
}
/**
 * Gets the set of category IDs this voter has already voted in.
 * Stored as a JSON array in localStorage.
 */
export function getVotedCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("spie_voted_categories");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markCategoryAsVoted(categoryId: string): void {
  if (typeof window === "undefined") return;
  const voted = getVotedCategories();
  if (!voted.includes(categoryId)) {
    voted.push(categoryId);
    localStorage.setItem("spie_voted_categories", JSON.stringify(voted));
  }
}
export function markCategoryVoted(categoryId: string): void {
  if (typeof window === 'undefined') return
  const voted = getVotedCategories()
  if (!voted.includes(categoryId)) {
    voted.push(categoryId)
    localStorage.setItem('spie_voted_categories', JSON.stringify(voted))
  }
}
export function hasVotedInCategory(categoryId: string): boolean {
  return getVotedCategories().includes(categoryId);
}