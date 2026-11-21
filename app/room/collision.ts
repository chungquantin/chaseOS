import { PLAYER_RADIUS } from "./layout";
import { COLLIDERS_ALL, walkable } from "./world";

function hitsFurniture(x: number, z: number) {
  const r = PLAYER_RADIUS;
  return COLLIDERS_ALL.some(
    (b) =>
      x + r > b.x - b.w / 2 &&
      x - r < b.x + b.w / 2 &&
      z + r > b.z - b.d / 2 &&
      z - r < b.z + b.d / 2
  );
}

const blocked = (x: number, z: number) => !walkable(x, z, PLAYER_RADIUS) || hitsFurniture(x, z);

/**
 * Move from (x, z) by (dx, dz), resolving each axis separately so the
 * character slides along furniture and walls instead of sticking to them.
 */
export function moveWithCollision(
  x: number,
  z: number,
  dx: number,
  dz: number
): { x: number; z: number; blocked: boolean } {
  let nx = x + dx;
  if (blocked(nx, z)) nx = x;

  let nz = z + dz;
  if (blocked(nx, nz)) nz = z;

  const wanted = Math.hypot(dx, dz);
  const got = Math.hypot(nx - x, nz - z);
  return { x: nx, z: nz, blocked: wanted > 0 && got < wanted * 0.25 };
}
