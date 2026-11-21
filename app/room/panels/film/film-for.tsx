"use client";

import type { ChapterId } from "app/data/career";
import { ARCHITECT_FILM } from "./architect";
import FilmPlayer from "./film-player";
import type { FilmDef } from "./types";

const FILMS: Partial<Record<ChapterId, FilmDef>> = {
  architect: ARCHITECT_FILM,
};

/** The film for a job, if it has one. Loaded lazily so three.js scenes stay out of the panel's first paint. */
export default function FilmFor({ id }: { id: ChapterId }) {
  const film = FILMS[id];
  return film ? <FilmPlayer film={film} /> : null;
}
