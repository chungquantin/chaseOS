/**
 * Plain-data map of the street: constants, the two rows of tube houses and
 * where the two landmark buildings (Past jobs, Projects) sit in them.
 * No React in here so layout/world code can import it.
 */
import { HALF, WALL_THICKNESS as T } from "./layout";

export const OUTER = -HALF - T / 2; // outer face of the room's walls
export const WALK = -0.3; // sidewalk height
export const ROAD_Y = -0.42;
export const ROAD_IN = 7.6; // curb line
export const ROAD_W = 6;
export const ROAD_OUT = ROAD_IN + ROAD_W;
export const FLOOR_H = 3.2;
export const ALLEY = -9.2; // the left row starts after the alley
/** the far edge of the walkable sidewalk (leaves a margin to the curb) */
export const SIDE_MAX = ROAD_IN - 0.45;
export const SIDE_FAR = -52;

export const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

export const FACADE = ["#d8c690", "#a9c4ba", "#d4b3a8", "#d6d0c2", "#aebdcc", "#cfac8c", "#c3b9cf", "#d9d0a8", "#b7c9a8"];
export const SIGN_COUNT = 9;

export type HouseSpec = { width: number; depth: number; floors: number; color: string; seed: number; shop: number | null };

/** Width of the two walk-in buildings that open the left row. */
export const BUILDING_W = 13;
export type BuildingId = "jobs" | "projects";

function makeRows() {
  const r = rng(42);
  const make = (count: number) =>
    Array.from({ length: count }, (_, i): HouseSpec => ({
      width: 4.4 + Math.round(r() * 3) * 0.6,
      depth: 10.15,
      // low next to the room, taller further away: the room stays the subject
      floors: i === 0 ? 2 : i === 1 ? 2 + Math.floor(r() * 2) : 2 + Math.floor(r() * 3),
      color: FACADE[Math.floor(r() * FACADE.length)],
      seed: i + count * 10,
      shop: r() > 0.25 ? Math.floor(r() * SIGN_COUNT) : null,
    }));
  return { left: make(5), right: make(5) };
}

const rows = makeRows();

/** The two buildings take the first two slots of the left row. */
const BUILDING_ORDER: BuildingId[] = ["jobs", "projects"];

/** left row: fronts at z = HALF facing +z, running toward -x from the alley */
export const LEFT = (() => {
  let x = ALLEY;
  return rows.left.map((h, i) => {
    const width = i < BUILDING_ORDER.length ? BUILDING_W : h.width;
    const cx = x - width / 2;
    x -= width;
    return { h: { ...h, width }, pos: [cx, 0, HALF] as [number, number, number], rot: 0, building: BUILDING_ORDER[i] ?? null };
  });
})();

/** right row: fronts at x = HALF facing +x, running toward -z from the room */
export const RIGHT = (() => {
  let z = OUTER;
  return rows.right.map((h) => {
    const cz = z - h.width / 2;
    z -= h.width;
    return { h, pos: [HALF, 0, cz] as [number, number, number], rot: Math.PI / 2 };
  });
})();

export type Building = { x0: number; x1: number; z0: number; z1: number; cx: number; cz: number };

/** Footprints of the walk-in buildings (z1 is the front, on the sidewalk). */
export const BUILDINGS: Record<BuildingId, Building> = Object.fromEntries(
  LEFT.filter((l) => l.building).map((l) => {
    const w = l.h.width;
    const b: Building = { x0: l.pos[0] - w / 2, x1: l.pos[0] + w / 2, z0: HALF - l.h.depth, z1: HALF, cx: l.pos[0], cz: HALF - l.h.depth / 2 };
    return [l.building!, b];
  })
) as Record<BuildingId, Building>;

/** Width of the doorway in a building's front wall. */
export const DOOR_W = 2.2;
