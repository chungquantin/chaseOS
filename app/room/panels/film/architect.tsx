"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Vector3 } from "three";
import { ease, lerp3, seg, type Clock, type V3 } from "./lowpoly";
import { SkyDome, Sun } from "./props";
import { SceneA, SceneB } from "./scenes-ab";
import { SceneC, SceneD } from "./scenes-cd";
import { END, NARRATION, SCENE_START, T } from "./timeline";
import type { FilmDef } from "./types";

/**
 * "Architect" as a short low-poly film with a voice-over. Four dioramas laid
 * out along x; the camera moves between them on a shot list. Every event is
 * keyed to the narration (see timeline.ts), so picture and voice stay together.
 *
 *   joining the exchange → Liquid Inference → AX trading core → the result
 */

const STEP = 40; // distance between dioramas

export const ARCHITECT_FILM: FilmDef = {
  duration: END,
  accent: "#38bdf8",
  narration: NARRATION,
  chapters: [
    { at: SCENE_START[0], title: "Joining the exchange" },
    { at: SCENE_START[1], title: "Liquid Inference" },
    { at: SCENE_START[2], title: "AX trading core" },
    { at: SCENE_START[3], title: "The result" },
  ],
  captions: [
    { from: T.a1[0], to: T.a1[1], text: "Architect", sub: "The intelligence exchange: a market for compute, inference, commodities and currencies." },
    { from: T.a2[0], to: T.a2[1], text: "Software Engineer, 2026", sub: "Rust and TypeScript, wherever latency matters." },
    { from: T.b1[0], to: T.b1[1], text: "Liquid Inference, built from zero", sub: "An LLM gateway where providers compete on price for every request." },
    { from: T.b2[0], to: T.b2[1], text: "One gateway, every modality", sub: "Text, images, speech, video and transcription." },
    { from: T.b3[0], to: T.b3[1], text: "Routed to the cheapest model that fits", sub: "Providers bid; the lowest offer that meets your rules wins." },
    { from: T.b4[0], to: T.b4[1], text: "Or bring your own key", sub: "With spend caps and a receipt for every request." },
    { from: T.c1[0], to: T.c1[1], text: "AX, a regulated perpetual futures exchange", sub: "Forex, equities, commodities and indices." },
    { from: T.c2[0], to: T.c2[1], text: "The order management system", sub: "Written in Rust, so every order moves fast." },
    { from: T.c3[0], to: T.c3[1], text: "The risk engine", sub: "Margin checked on every position, liquidation when it has to." },
    { from: T.c4[0], to: T.c4[1], text: "The market maker program", sub: "Keeping the order book deep for traders." },
    { from: T.d1[0], to: T.d1[1], text: "0 → 1 · BYOK · AX", sub: "Built from zero, touching almost every feature along the way." },
    { from: T.d2[0], to: END - 1, text: "Still building", sub: "Architect · Software Engineer · 2026 –" },
  ],
  Scene: ArchitectScene,
};

/* --------------------------------------------------------------- shots */

type Key = { t: number; s: number; pos: V3; look: V3 };
/** Camera shots in local coordinates of scene `s`; between scenes the camera glides with an arc. */
const SHOTS: Key[] = [
  // joining the exchange
  { t: 0, s: 0, pos: [15, 12, 23], look: [0, 3.5, 0] },
  { t: 4, s: 0, pos: [10, 7, 15], look: [-2, 2.6, 2] },
  { t: 7.2, s: 0, pos: [3.6, 3.2, 13.6], look: [-1.6, 1.9, 5.2] },
  { t: 11, s: 0, pos: [2.2, 3.9, 13], look: [-1.4, 2.4, 5.2] },
  { t: 14.2, s: 0, pos: [9, 6.5, 15], look: [0, 2.8, 1] },
  // Liquid Inference
  { t: 16.4, s: 1, pos: [11, 9, 18], look: [0, 1, 0] },
  { t: 20.5, s: 1, pos: [8, 9, 13], look: [-1.5, 1, 1] },
  { t: 24.6, s: 1, pos: [6, 8, 11], look: [0, 1.4, 0] },
  { t: 27.5, s: 1, pos: [3.5, 8.5, 13], look: [0, 1.5, -1] },
  { t: 31.5, s: 1, pos: [-2, 8.5, 12], look: [0.5, 1.4, -0.5] },
  { t: 34.5, s: 1, pos: [3, 8.5, 14], look: [5, 1.4, 0] },
  { t: 39.5, s: 1, pos: [10, 8.5, 12], look: [5, 1.4, 1.5] },
  { t: 42.5, s: 1, pos: [-2, 7, 10.5], look: [-1, 1.6, 1.5] },
  { t: 44.4, s: 1, pos: [10, 7.5, 17], look: [0, 1.5, 0] },
  // AX
  { t: 46.2, s: 2, pos: [12, 10, 21], look: [0, 1, 0] },
  { t: 50.5, s: 2, pos: [7, 9, 15], look: [0, 2, -1.5] },
  { t: 54.6, s: 2, pos: [9, 9, 14], look: [-2, 1, 0] },
  { t: 56.8, s: 2, pos: [-1, 7, 9], look: [-4, 1, 0] },
  { t: 60.3, s: 2, pos: [5.5, 7.5, 11.5], look: [1.5, 1.4, 0] },
  { t: 63.8, s: 2, pos: [4, 6.5, 10.5], look: [2.5, 1.4, 0.5] },
  { t: 66.6, s: 2, pos: [13.5, 8.5, 12], look: [7, 1.2, 0] },
  { t: 69.6, s: 2, pos: [12, 10, 18], look: [2, 1.2, 0] },
  // the result
  { t: 71.2, s: 3, pos: [10, 7, 16], look: [0, 2.5, 0] },
  { t: 75, s: 3, pos: [5, 5, 11], look: [0, 3, 0] },
  { t: 79.4, s: 3, pos: [6.5, 4.2, 10.5], look: [2, 1.5, 1.5] },
  { t: END, s: 3, pos: [9, 6.2, 14], look: [2, 2.2, 1] },
];

const world = (k: Key, v: V3): V3 => [v[0] + k.s * STEP, v[1], v[2]];
/** the two wide dioramas need the camera a little further back */
const dolly = (k: Key): V3 => {
  const f = k.s === 1 || k.s === 2 ? 1.14 : 1;
  const p: V3 = [k.look[0] + (k.pos[0] - k.look[0]) * f, k.look[1] + (k.pos[1] - k.look[1]) * f, k.look[2] + (k.pos[2] - k.look[2]) * f];
  return world(k, p);
};

function CameraRig({ clock }: { clock: Clock }) {
  const { camera } = useThree();
  const look = useRef(new Vector3());
  useFrame(() => {
    const t = clock.current;
    let i = 0;
    for (let n = 0; n < SHOTS.length - 1; n++) if (t >= SHOTS[n].t) i = n;
    const a = SHOTS[i];
    const b = SHOTS[Math.min(i + 1, SHOTS.length - 1)];
    const k = ease(seg(t, a.t, b.t));
    const pos = lerp3(dolly(a), dolly(b), k);
    const lk = lerp3(world(a, a.look), world(b, b.look), k);
    const crossing = a.s !== b.s ? Math.sin(k * Math.PI) * 4 : 0;
    // a touch of handheld drift
    const dx = Math.sin(t * 0.9) * 0.12;
    const dy = Math.sin(t * 1.3 + 1) * 0.08;
    camera.position.set(pos[0] + dx, pos[1] + crossing + dy, pos[2]);
    look.current.set(lk[0], lk[1], lk[2]);
    camera.lookAt(look.current);
  });
  return null;
}

/** Which diorama the light should be over right now. */
const sceneCenter = (t: number) => {
  let s = 0;
  SCENE_START.forEach((st, i) => {
    if (t >= st - 0.8) s = i;
  });
  return s * STEP;
};

function ArchitectScene({ clock }: { clock: Clock }) {
  return (
    <>
      <color attach="background" args={["#0a1128"]} />
      <fog attach="fog" args={["#1a1840", 34, 90]} />
      <SkyDome />
      <hemisphereLight args={["#aebfff", "#2a1f4a", 0.95]} />
      <Sun clock={clock} centers={sceneCenter} />
      <directionalLight position={[-14, 8, -10]} intensity={0.9} color="#7aa2ff" />
      <CameraRig clock={clock} />
      <group position={[0, 0, 0]}>
        <SceneA clock={clock} />
      </group>
      <group position={[STEP, 0, 0]}>
        <SceneB clock={clock} />
      </group>
      <group position={[STEP * 2, 0, 0]}>
        <SceneC clock={clock} />
      </group>
      <group position={[STEP * 3, 0, 0]}>
        <SceneD clock={clock} />
      </group>
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.3} intensity={0.9} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Vignette offset={0.25} darkness={0.55} />
      </EffectComposer>
    </>
  );
}

