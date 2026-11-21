"use client";

import { useSyncExternalStore } from "react";
import { isAction, PLAYER_START, type ActionId, type PanelId, type TargetId } from "./layout";
import { routeTo } from "./world";

export type Mood = "day" | "night";
/** loading screen → ID card → free to roam */
export type Stage = "loading" | "intro" | "room";

/**
 * Tiny external store shared by the 3D scene and the DOM overlay.
 *
 * Reactive fields (subscribe via useRoom) drive UI. Per-frame values like the
 * player position live in `live` and are mutated directly to avoid re-renders.
 */
type State = {
  /** overlay currently open, if any */
  active: PanelId | null;
  /** what the open overlay should show (a chapter or app id), if it takes one */
  arg: string | null;
  /** what the character is doing (climbing, gaming), if anything */
  action: ActionId | null;
  /** interactable the player is standing close to */
  nearby: TargetId | null;
  /** interactable the player is walking towards (used on arrival) */
  pending: TargetId | null;
  mood: Mood;
  stage: Stage;
  /** the 3D scene has rendered its first frames */
  ready: boolean;
};

// Night is the hero look (warm room, dark world). The toggle switches to day.
let state: State = { active: null, arg: null, action: null, nearby: null, pending: null, mood: "night", stage: "loading", ready: false };
const listeners = new Set<() => void>();

export const live = {
  player: { x: PLAYER_START[0], z: PLAYER_START[1] },
  /** click-to-move destination, null when idle or using the keyboard */
  target: null as { x: number; z: number } | null,
  /** waypoints still to walk after `target`, and the final destination */
  route: [] as { x: number; z: number }[],
  goal: null as { x: number; z: number } | null,
  /** seconds since the current action started (advanced by the player) */
  actionTime: 0,
  /** visitor zoom on top of the fitted zoom (1 = whole room) */
  zoom: 1,
};

export const ZOOM_MIN = 0.75;
export const ZOOM_MAX = 3;

function set(patch: Partial<State>) {
  const next = { ...state, ...patch };
  if ((Object.keys(next) as (keyof State)[]).every((k) => next[k] === state[k])) return;
  state = next;
  listeners.forEach((l) => l());
}

export const room = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Use an interactable: open its overlay or start its action. */
  use(id: TargetId) {
    live.target = null;
    live.route = [];
    live.goal = null;
    if (isAction(id as TargetId)) {
      live.actionTime = 0;
      set({ action: id as "climb" | "game", active: null, pending: null });
    } else if (id.startsWith("job:")) {
      set({ active: "jobs", arg: id.slice(4), action: null, pending: null });
    } else if (id.startsWith("app:")) {
      set({ active: "app", arg: id.slice(4), action: null, pending: null });
    } else if (id === "repos") {
      set({ active: "projects", arg: null, action: null, pending: null });
    } else {
      set({ active: id as PanelId, arg: null, action: null, pending: null });
    }
  },
  close() {
    set({ active: null, arg: null });
  },
  stopAction() {
    set({ action: null });
  },
  setNearby(id: TargetId | null) {
    set({ nearby: id });
  },
  walkTo(x: number, z: number, pending: TargetId | null = null) {
    if (state.stage !== "room") return;
    const path = routeTo(live.player, { x, z });
    live.target = path[0];
    live.route = path.slice(1);
    live.goal = { x, z };
    set({ pending, action: null });
  },
  cancelWalk() {
    live.target = null;
    live.route = [];
    live.goal = null;
    set({ pending: null });
  },
  setReady() {
    set({ ready: true });
  },
  setStage(stage: Stage) {
    set({ stage, ...(stage !== "room" ? { active: null, action: null, pending: null } : {}) });
    if (stage !== "room") live.target = null;
  },
  zoomBy(factor: number) {
    live.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, live.zoom * factor));
  },
  resetZoom() {
    live.zoom = 1;
  },
  syncMoodToClock() {
    const h = new Date().getHours();
    set({ mood: h >= 7 && h < 18 ? "day" : "night" });
  },
  toggleMood() {
    set({ mood: state.mood === "day" ? "night" : "day" });
  },
};

export function useRoom<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    room.subscribe,
    () => selector(state),
    () => selector(state)
  );
}
