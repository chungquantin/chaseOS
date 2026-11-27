/**
 * Everything about *where* the character can walk: the room, the sidewalks
 * outside it, and the inside of the two buildings on the left row. It is all
 * one continuous world (no loading between them): you walk out of the room,
 * along the sidewalk and in through a building's door.
 *
 * All coordinates are world coordinates.
 */
import { BUILT_APPS } from "app/data/apps";
import { chapters } from "app/data/career";
import { COLLIDERS, HALF, INNER, INTERACTABLES, type Box, type Interactable } from "./layout";
import { BUILDINGS, DOOR_W, SIDE_FAR, SIDE_MAX, WALK, type Building, type BuildingId } from "./streetmap";

export type Rect = { x0: number; x1: number; z0: number; z1: number };
type Pt = { x: number; z: number };

export const ROOM_RECT: Rect = { x0: INNER, x1: HALF, z0: INNER, z1: HALF };

const J = BUILDINGS.jobs;
const P = BUILDINGS.projects;

/** Floor you can walk on inside a building: inside the low walls. */
const interior = (b: Building): Rect => ({ x0: b.x0 + 0.3, x1: b.x1 - 0.3, z0: b.z0 + 0.3, z1: b.z1 - 0.3 });
/** The gap in a building's front wall, overlapping the sidewalk. */
const doorway = (b: Building): Rect => ({ x0: b.cx - DOOR_W / 2 + 0.1, x1: b.cx + DOOR_W / 2 - 0.1, z0: b.z1 - 0.4, z1: b.z1 + 0.05 });

/* ------------------------------------------------------------ exhibits */

export type Statue = { id: string; at: [number, number]; spot: [number, number] };

const toward = (from: [number, number], to: [number, number], d: number): [number, number] => {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const l = Math.hypot(dx, dz) || 1;
  return [from[0] + (dx / l) * d, from[1] + (dz / l) * d];
};

/** Six apps: four along the back wall, two in front of them. */
export const APP_STATUES: Statue[] = BUILT_APPS.map((a, i) => {
  const at: [number, number] = i < 4 ? [P.cx + (i - 1.5) * 2.9, P.z0 + 2.0] : [P.cx + (i === 4 ? -3.2 : 3.2), P.cz + 1.0];
  return { id: a.id, at, spot: [at[0], at[1] + 1.35] };
});

/** The open-source board on the Projects building's left wall. */
export const REPO_WALL = { x: P.x0 + 0.55, z: P.cz + 0.6 };

/** Today's job stands at the centre; the six before it arc round the back wall. */
const NOW = chapters[chapters.length - 1];
const PAST = chapters.slice(0, -1);
export const JOB_CENTER: [number, number] = [J.cx, J.cz + 0.3];
export const JOB_STATUES: Statue[] = [
  { id: NOW.id, at: JOB_CENTER, spot: [JOB_CENTER[0], JOB_CENTER[1] + 2.3] },
  ...PAST.map((c, i): Statue => {
    const th = Math.PI * (1.1 + (i / (PAST.length - 1)) * 0.8);
    const at: [number, number] = [J.cx + Math.cos(th) * 5.0, J.cz + 0.7 + Math.sin(th) * 3.0];
    return { id: c.id, at, spot: toward(at, JOB_CENTER, 1.4) };
  }),
];

const box = (at: [number, number], w: number, d: number): Box => ({ x: at[0], z: at[1], w, d, h: 1 });

/* ---------------------------------------------------------- walkable */

const RECTS: Rect[] = [
  ROOM_RECT,
  // along the room's front (z), where the buildings' doors are
  { x0: SIDE_FAR, x1: SIDE_MAX, z0: HALF, z1: SIDE_MAX },
  // along the room's side (x), toward the right-hand row
  { x0: HALF, x1: SIDE_MAX, z0: SIDE_FAR, z1: SIDE_MAX },
  interior(J),
  interior(P),
  doorway(J),
  doorway(P),
];

/** Things that block you. */
export const COLLIDERS_ALL: Box[] = [
  ...COLLIDERS,
  ...APP_STATUES.map((s) => box(s.at, 1.2, 1.2)),
  box(JOB_CENTER, 2.4, 2.4),
  ...JOB_STATUES.slice(1).map((s) => box(s.at, 1.2, 1.2)),
  { x: REPO_WALL.x, z: REPO_WALL.z, w: 0.5, d: 3.2, h: 1 },
];

const inRect = (r: Rect, x: number, z: number) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
export const inRoom = (x: number, z: number) => inRect(ROOM_RECT, x, z);

/** Is a body of this radius standing fully on walkable ground? */
export function walkable(x: number, z: number, r: number) {
  const ok = (px: number, pz: number) => RECTS.some((rc) => inRect(rc, px, pz));
  return ok(x, z) && ok(x - r, z) && ok(x + r, z) && ok(x, z - r) && ok(x, z + r);
}

/** Nearest walkable point to a click (so clicking the road walks to the kerb). */
export function snapToWalkable(x: number, z: number): [number, number] {
  let best: [number, number] = [x, z];
  let bestD = Infinity;
  for (const r of RECTS) {
    const cx = Math.min(r.x1, Math.max(r.x0, x));
    const cz = Math.min(r.z1, Math.max(r.z0, z));
    const d = Math.hypot(cx - x, cz - z);
    if (d < bestD) {
      bestD = d;
      best = [cx, cz];
    }
  }
  return best;
}

/** Floors that sit at "indoor" height; the sidewalk is a step below. */
const FLOORS: Rect[] = [ROOM_RECT, interior(J), interior(P)];

/** Height of the ground under the character, easing down the step at doors. */
export function groundY(x: number, z: number) {
  let d = Infinity;
  for (const r of FLOORS) {
    const dx = Math.max(r.x0 - x, 0, x - r.x1);
    const dz = Math.max(r.z0 - z, 0, z - r.z1);
    d = Math.min(d, Math.hypot(dx, dz));
  }
  const k = Math.min(1, d / 0.6);
  return WALK * (k * k * (3 - 2 * k));
}

/** Is the character out of the room (camera should follow tightly)? */
export const isOutside = (x: number, z: number) => !inRoom(x, z);

/* ----------------------------------------------------------- routing */

type Region = "room" | "a" | "b" | BuildingId;

const insideBuilding = (p: Pt): BuildingId | null => {
  for (const id of ["jobs", "projects"] as const) {
    const b = BUILDINGS[id];
    if (p.x >= b.x0 && p.x <= b.x1 && p.z >= b.z0 && p.z <= b.z1 - 0.2) return id;
  }
  return null;
};
const region = (p: Pt): Region => (inRoom(p.x, p.z) ? "room" : insideBuilding(p) ?? (p.x > HALF ? "b" : "a"));
const clampTo = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Points to walk through to get from `from` to `to`. The room opens onto the
 * sidewalk along its front (z) and its side (x); the sidewalks meet at the
 * corner; each building's door is in the middle of its front. Straight lines
 * would bump into walls.
 */
export function routeTo(from: Pt, to: Pt): Pt[] {
  const rf = region(from);
  const rt = region(to);
  if (rf === rt) return [to];
  const out = HALF + 0.6;
  const inX = (v: number) => clampTo(v, INNER + 0.5, HALF - 0.5);
  const path: Pt[] = [];

  // 1. out onto a sidewalk
  let strip: "a" | "b";
  if (rf === "room") {
    strip = rt === "b" ? "b" : "a";
    path.push(strip === "a" ? { x: inX(from.x), z: out } : { x: out, z: inX(from.z) });
  } else if (rf === "a" || rf === "b") {
    strip = rf;
  } else {
    const b = BUILDINGS[rf];
    path.push({ x: b.cx, z: b.z1 - 0.9 }, { x: b.cx, z: out });
    strip = "a";
  }

  // 2. along to the right sidewalk, round the corner if needed
  const want = rt === "b" ? "b" : "a";
  if (strip !== want) path.push({ x: out, z: out });

  // 3. in through the target's door
  if (rt === "room") path.push(want === "a" && rf !== "b" ? { x: inX(to.x), z: out } : { x: inX(to.x), z: out });
  else if (rt !== "a" && rt !== "b") {
    const b = BUILDINGS[rt];
    path.push({ x: b.cx, z: out }, { x: b.cx, z: b.z1 - 0.9 });
  }
  path.push(to);
  return path;
}

/* ------------------------------------------------------ interactables */

export const WORLD_INTERACTABLES: Interactable[] = [
  ...APP_STATUES.map((s): Interactable => {
    const a = BUILT_APPS.find((x) => x.id === s.id)!;
    return { id: `app:${s.id}`, label: a.name, verb: `Look at ${a.name}`, spot: s.spot, labelAt: [s.at[0], 2.35, s.at[1]] };
  }),
  {
    id: "repos",
    label: "Open source",
    verb: "Browse my GitHub repos",
    spot: [P.x0 + 1.9, REPO_WALL.z],
    labelAt: [REPO_WALL.x, 2.7, REPO_WALL.z],
  },
  ...JOB_STATUES.map((s, i): Interactable => {
    const c = chapters.find((x) => x.id === s.id)!;
    return {
      id: `job:${s.id}`,
      label: i === 0 ? `${c.company} (now)` : c.company,
      verb: `Look at ${c.company}`,
      spot: s.spot,
      labelAt: [s.at[0], i === 0 ? 3.4 : 2.45, s.at[1]],
    };
  }),
];

export const ALL_INTERACTABLES: Interactable[] = [...INTERACTABLES, ...WORLD_INTERACTABLES];
