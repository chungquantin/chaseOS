"use client";

import type { TargetId } from "./layout";
import { room } from "./store";
import { ALL_INTERACTABLES } from "./world";

/** Close any open overlay and walk the character to an object; it's used on arrival. */
export function visit(id: TargetId) {
  const it = ALL_INTERACTABLES.find((i) => i.id === id);
  if (!it) return;
  room.close();
  room.walkTo(it.spot[0], it.spot[1], id);
}
