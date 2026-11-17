import { COLLIDERS, HALF, PLAYER_RADIUS, WALL_THICKNESS } from "./layout";

function hitsFurniture(x: number, z: number) {
  const r = PLAYER_RADIUS;
  return COLLIDERS.some(
    (b) =>
      x + r > b.x - b.w / 2 &&
      x - r < b.x + b.w / 2 &&
      z + r > b.z - b.d / 2 &&
      z - r < b.z + b.d / 2
  );
}

const MIN = -HALF + WALL_THICKNESS / 2 + PLAYER_RADIUS;
const MAX = HALF - PLAYER_RADIUS;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

/**
 * Move from (x, z) by (dx, dz), resolving each axis separately so the
 * character slides along furniture instead of sticking to it.
 */
export function moveWithCollision(
  x: number,
  z: number,
  dx: number,
  dz: number
): { x: number; z: number; blocked: boolean } {
  let nx = clamp(x + dx);
  let nz = z;
  if (hitsFurniture(nx, nz)) nx = x;

  nz = clamp(z + dz);
  if (hitsFurniture(nx, nz)) nz = z;

  const wanted = Math.hypot(dx, dz);
  const got = Math.hypot(nx - x, nz - z);
  return { x: nx, z: nz, blocked: wanted > 0 && got < wanted * 0.25 };
}
