"use client";

import { useSyncExternalStore } from "react";
import { isAction, PLAYER_START, type ActionId, type PanelId, type TargetId } from "./layout";

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
  /** real loading progress, 0–1 (code, textures, shaders, first frame) */
  load: number;
};

// Night is the hero look (warm room, dark world). The toggle switches to day.
let state: State = { active: null, action: null, nearby: null, pending: null, mood: "night", stage: "loading", ready: false, load: 0.08 };
const listeners = new Set<() => void>();

export const live = {
  player: { x: PLAYER_START[0], z: PLAYER_START[1] },
  /** click-to-move destination, null when idle or using the keyboard */
  target: null as { x: number; z: number } | null,
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
    if (isAction(id)) {
      live.actionTime = 0;
      set({ action: id, active: null, pending: null });
    } else {
      set({ active: id, action: null, pending: null });
    }
  },
  close() {
    set({ active: null });
  },
  stopAction() {
    set({ action: null });
  },
  setNearby(id: TargetId | null) {
    set({ nearby: id });
  },
  walkTo(x: number, z: number, pending: TargetId | null = null) {
    if (state.stage !== "room") return;
    live.target = { x, z };
    set({ pending, action: null });
  },
  cancelWalk() {
    live.target = null;
    set({ pending: null });
  },
  setReady() {
    set({ ready: true, load: 1 });
  },
  /** report loading progress; it only ever moves forward */
  setLoad(p: number) {
    if (p > state.load) set({ load: Math.min(1, p) });
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
