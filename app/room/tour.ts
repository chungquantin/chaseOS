"use client";

import { INTERACTABLES, type TargetId } from "./layout";
import { room } from "./store";

/** Close any open overlay and walk the character to an object; it's used on arrival. */
export function visit(id: TargetId) {
  const it = INTERACTABLES.find((i) => i.id === id);
  if (!it) return;
  room.close();
  room.walkTo(it.spot[0], it.spot[1], id);
}
