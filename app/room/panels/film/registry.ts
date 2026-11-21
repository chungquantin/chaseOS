import type { ChapterId } from "app/data/career";

/** Jobs that have an animated story. (The scenes themselves are lazy-loaded: see film-for.tsx.) */
export const HAS_FILM = new Set<ChapterId>(["architect"]);
