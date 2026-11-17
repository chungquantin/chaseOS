"use client";

import { useSyncExternalStore } from "react";
import { PLAYLIST, type Track } from "app/data/playlist";
import { music as lamplight } from "./music";

/**
 * One music player for the whole site: the corner mini player, the HUD
 * button, the computer's Music app and the terminal all drive this.
 *
 * YouTube tracks play through a YouTube iframe player that <MiniPlayer>
 * creates and attaches here; the "Lamplight" track uses the Web Audio
 * engine in music.ts.
 */

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(id: string): void;
  cueVideoById(id: string): void;
  setVolume(v: number): void;
  destroy(): void;
};

type State = {
  index: number;
  playing: boolean;
  /** the YouTube player is ready to take commands */
  ready: boolean;
  /** the visitor has started music at least once this visit (shows the mini player) */
  engaged: boolean;
};

const PREF_KEY = "tc-room:music";
const TRACK_KEY = "tc-room:track";

function readTrack() {
  try {
    const id = window.localStorage.getItem(TRACK_KEY);
    const i = PLAYLIST.findIndex((t) => t.id === id);
    return i >= 0 ? i : 0;
  } catch {
    return 0;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

let state: State = { index: 0, playing: false, ready: false, engaged: false };
let loaded = false;
const subs = new Set<() => void>();
let yt: YTPlayer | null = null;
/** play was requested before the YouTube player was ready */
let pending = false;

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = { ...state, index: readTrack() };
}

const current = (): Track => PLAYLIST[state.index];

export const media = {
  get(): State {
    ensureLoaded();
    return state;
  },
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => subs.delete(fn);
  },
  track: current,

  /** visitor's last choice; defaults to on */
  wanted() {
    try {
      return window.localStorage.getItem(PREF_KEY) !== "off";
    } catch {
      return true;
    }
  },

  attach(player: YTPlayer) {
    yt = player;
    yt.setVolume(70);
    set({ ready: true });
    const t = current();
    if (t.kind === "youtube") {
      if (pending) yt.loadVideoById(t.id);
      else yt.cueVideoById(t.id);
    }
    pending = false;
  },
  detach() {
    yt = null;
    set({ ready: false });
  },

  play() {
    ensureLoaded();
    const t = current();
    if (t.kind === "generative") {
      yt?.pauseVideo();
      lamplight.start();
    } else {
      if (lamplight.playing) lamplight.stop();
      if (yt) yt.playVideo();
      else pending = true;
    }
    write(PREF_KEY, "on");
    set({ playing: true, engaged: true });
  },
  pause() {
    if (lamplight.playing) lamplight.stop();
    yt?.pauseVideo();
    pending = false;
    write(PREF_KEY, "off");
    set({ playing: false });
  },
  toggle() {
    if (state.playing) media.pause();
    else media.play();
  },
  select(index: number) {
    ensureLoaded();
    const i = (index + PLAYLIST.length) % PLAYLIST.length;
    const t = PLAYLIST[i];
    write(TRACK_KEY, t.id);
    set({ index: i });
    if (t.kind === "youtube") {
      if (lamplight.playing) lamplight.stop();
      if (yt) yt.loadVideoById(t.id); // loads and starts
      else pending = true;
    } else {
      yt?.pauseVideo();
      lamplight.start();
    }
    write(PREF_KEY, "on");
    set({ playing: true, engaged: true });
  },
  next() {
    media.select(state.index + 1);
  },
  prev() {
    media.select(state.index - 1);
  },

  /** YouTube player state changes (the visitor can also use YouTube's own controls) */
  onYouTubeState(code: number) {
    if (current().kind !== "youtube") return;
    if (code === 1 && !state.playing) set({ playing: true, engaged: true });
    else if (code === 2 && state.playing) set({ playing: false });
    else if (code === 0) media.next();
  },
  /** the video can't be embedded or was removed: skip it */
  onYouTubeError() {
    if (current().kind === "youtube") media.next();
  },
};

export function useMedia<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    media.subscribe,
    () => selector(media.get()),
    () => selector(state)
  );
}
