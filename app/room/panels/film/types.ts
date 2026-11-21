import type { ComponentType } from "react";
import type { Clock } from "./lowpoly";

export type Caption = { from: number; to: number; text: string; sub?: string };

/** A short animated story for one job. Time is in seconds; the scene is a pure function of it. */
export type FilmDef = {
  duration: number;
  accent: string;
  chapters: { at: number; title: string }[];
  captions: Caption[];
  Scene: ComponentType<{ clock: Clock }>;
};
