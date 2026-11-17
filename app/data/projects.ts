/**
 * Projects shown in the display case.
 *
 * By default the case shows your most-starred original repos, fetched at build
 * time through /api/github/repositories. To curate it, list repo names (or
 * "owner/repo") in FEATURED — they'll be shown in that order instead.
 */
export const FEATURED: string[] = [];

export const MAX_PROJECTS = 9;

export type Project = {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  topics: string[];
};

type RawRepo = {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  fork?: boolean;
  is_contributed?: boolean;
  topics?: string[];
};

export function pickProjects(raw: RawRepo[]): Project[] {
  const toProject = (r: RawRepo): Project => ({
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count ?? 0,
    url: r.html_url,
    topics: r.topics ?? [],
  });

  if (FEATURED.length) {
    return FEATURED.map((f) => raw.find((r) => r.full_name === f || r.name === f))
      .filter((r): r is RawRepo => Boolean(r))
      .map(toProject);
  }
  return raw
    // skip forks, repos only contributed to, and the profile-README repo
    .filter((r) => !r.fork && !r.is_contributed && r.name !== r.full_name.split("/")[0])
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_PROJECTS)
    .map(toProject);
}

/** Box colour per language, so the case reads like a shelf of products. */
export const LANGUAGE_COLORS: Record<string, string> = {
  Rust: "#dea584",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go: "#00add8",
  Python: "#3572a5",
  Solidity: "#aa6746",
  Move: "#4a90e2",
  "C++": "#f34b7d",
  Shell: "#89e051",
};

export const languageColor = (lang: string | null) =>
  (lang && LANGUAGE_COLORS[lang]) || "#9ca3af";
