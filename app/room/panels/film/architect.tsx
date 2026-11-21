"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import { Anim, Confetti, ease, easeOut, FilmChibi, Island, Label, lerp, lerp3, PAL, seg, Solid, type Clock, type Pose, type V3 } from "./lowpoly";
import type { FilmDef } from "./types";

/**
 * "Architect" as a short low-poly film: four small dioramas laid out along x,
 * with the camera gliding from one to the next.
 *
 *   0 – 7    joining the exchange
 *   7 – 20   Liquid Inference, the LLM gateway built from zero
 *  20 – 33   AX: order management, risk engine, market makers
 *  33 – 42   what came out of it
 */

const STEP = 40; // distance between dioramas
const at = (k: number): V3 => [k * STEP, 0, 0];
export const ARCH_DURATION = 42;
const STARTS = [0, 7, 20, 33];

export const ARCHITECT_FILM: FilmDef = {
  duration: ARCH_DURATION,
  accent: "#38bdf8",
  chapters: [
    { at: 0, title: "Joining the exchange" },
    { at: 7, title: "Liquid Inference" },
    { at: 20, title: "AX trading core" },
    { at: 33, title: "The result" },
  ],
  captions: [
    { from: 0.6, to: 3.5, text: "Architect", sub: "The intelligence exchange: a market for compute, inference, commodities and currencies." },
    { from: 3.7, to: 6.8, text: "Software Engineer, 2026", sub: "Rust, TypeScript, and a lot of low-latency code." },
    { from: 7.3, to: 10.2, text: "Liquid Inference, built from zero", sub: "An LLM gateway where providers compete on price for every request." },
    { from: 10.4, to: 14.0, text: "Text, image, speech, video, transcription", sub: "One gateway for every modality." },
    { from: 14.2, to: 17.4, text: "Routed to the cheapest model that fits", sub: "Providers bid; the lowest offer that meets your rules answers." },
    { from: 17.6, to: 19.8, text: "Or bring your own key", sub: "With spend caps and per-request receipts." },
    { from: 20.4, to: 23.4, text: "AX, a regulated perpetual futures exchange", sub: "Forex, equities, commodities and indices." },
    { from: 23.6, to: 26.6, text: "The order management system", sub: "Rust, built for low latency." },
    { from: 26.8, to: 29.8, text: "The risk engine", sub: "Margin checks and liquidation on every position." },
    { from: 30.0, to: 32.8, text: "The market maker liquidity program", sub: "Deep books for traders to trade against." },
    { from: 33.6, to: 37.8, text: "0 → 1, BYOK, AX", sub: "Built from zero, and touching almost every feature along the way." },
    { from: 38.0, to: 41.8, text: "Still building", sub: "Architect · Software Engineer · 2026 –" },
  ],
  Scene: ArchitectScene,
};

/* ------------------------------------------------------------- helpers */

/** Position along a polyline for u in 0..1 (equal speed). */
function along(route: V3[], u: number): V3 {
  const lens = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1], p[2] - route[i][2]));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = u * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) return lerp3(route[i], route[i + 1], lens[i] ? d / lens[i] : 0);
    d -= lens[i];
  }
  return route[route.length - 1];
}

/** Little cubes that stream along a route between `from` and `to` seconds. */
function Flow({
  clock,
  route,
  from,
  to,
  c,
  period = 1.3,
  count = 3,
  size = 0.3,
  kind = "box",
}: {
  clock: Clock;
  route: V3[];
  from: number;
  to: number;
  c: string;
  period?: number;
  count?: number;
  size?: number;
  kind?: "box" | "octa" | "sphere";
}) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = clock.current;
    g.children.forEach((m, i) => {
      const local = t - from - (i * period) / count;
      const on = local >= 0 && t < to + period;
      const u = (((local % period) + period) % period) / period;
      const fade = Math.min(1, seg(t, from, from + 0.4)) * (t < to ? 1 : Math.max(0, 1 - (t - to) / period));
      m.visible = on && fade > 0.02;
      const p = along(route, u);
      m.position.set(p[0], p[1] + Math.sin(u * Math.PI) * 0.35, p[2]);
      m.rotation.y = t * 2 + i;
      m.scale.setScalar(size * fade * (0.6 + 0.4 * Math.sin(u * Math.PI)));
    });
  });
  return (
    <group ref={ref}>
      {Array.from({ length: count }, (_, i) => (
        <Solid key={i} kind={kind} c={c} glow={0.7} />
      ))}
    </group>
  );
}

/** Fade/scale something in at `t0` over `dur`. */
function Pop({ clock, t0, dur = 0.7, children, y = 0 }: { clock: Clock; t0: number; dur?: number; children: React.ReactNode; y?: number }) {
  return (
    <Anim
      clock={clock}
      update={(g, t) => {
        const k = easeOut(seg(t, t0, t0 + dur));
        g.visible = k > 0.001;
        g.scale.setScalar(Math.max(0.001, k));
        g.position.y = y + (1 - k) * -0.6;
      }}
    >
      {children}
    </Anim>
  );
}

const walk = (t: number, a: number, b: number, from: V3, to: V3): Pose => {
  const k = ease(seg(t, a, b));
  const moving = k > 0 && k < 1;
  const sw = Math.sin(t * 9) * (moving ? 0.6 : 0);
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  return {
    x: lerp(from[0], to[0], k),
    z: lerp(from[2], to[2], k),
    ry: Math.atan2(dx, dz),
    legs: sw,
    armL: [-sw * 0.8, 0.08],
    armR: [sw * 0.8, -0.08],
    bob: moving ? Math.abs(Math.sin(t * 9)) * 0.04 : 0,
  };
};

/* ------------------------------------------------------------- scene A */

function Skyline({ clock }: { clock: Clock }) {
  const towers = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = i * 0.37 + 0.6;
        const r = 5.6 + (i % 3) * 1.3;
        const h = 2 + ((i * 7) % 5) * 0.95;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r - 1, h, w: 1.1 + (i % 2) * 0.4, c: [PAL.slate2, PAL.slate3, "#3b4a63"][i % 3], lit: [PAL.cyan, PAL.amber][i % 2], i };
      }).filter((t) => !(t.z > 2 && Math.abs(t.x) < 3.5)),
    []
  );
  return (
    <group>
      {towers.map((t) => (
        <group key={t.i} position={[t.x, 0, t.z]}>
          <Anim clock={clock} update={(g, time) => g.scale.set(1, Math.max(0.001, easeOut(seg(time, 0.1 + t.i * 0.07, 1.5 + t.i * 0.07))), 1)}>
            <Solid p={[0, t.h / 2, 0]} s={[t.w, t.h, t.w]} c={t.c} />
            {[0.3, 0.55, 0.8].map((f) => (
              <Solid key={f} p={[0, t.h * f, t.w / 2 + 0.01]} s={[t.w * 0.6, 0.1, 0.02]} c={t.lit} glow={0.9} />
            ))}
          </Anim>
        </group>
      ))}
    </group>
  );
}

function SceneA({ clock }: { clock: Clock }) {
  const pose = (t: number): Pose => {
    const w = walk(t, 0.4, 4.4, [-7.5, 0, 6.5], [-1.8, 0, 4.4]);
    const done = seg(t, 4.4, 4.8);
    if (done <= 0) return w;
    return { ...w, ry: lerp(w.ry ?? 0, 0.45, done), armL: [0, -2.4 + Math.sin(t * 7) * 0.3], headZ: 0.08 };
  };
  return (
    <group>
      <Island r={11} />
      {/* road to the entrance */}
      <Solid p={[0, 0.07, 4.2]} s={[2.4, 0.04, 9]} c="#273449" />
      <Skyline clock={clock} />
      {/* the exchange */}
      <Anim clock={clock} update={(g, t) => g.scale.y = Math.max(0.001, easeOut(seg(t, 0.2, 1.8)))}>
        <Solid kind="cyl" p={[0, 4, -1.5]} s={[2.4, 8, 2.4]} c={PAL.slate3} sides={6} />
        <Solid kind="cyl" p={[0, 0.5, -1.5]} s={[3.2, 1, 3.2]} c={PAL.slate2} sides={6} />
      </Anim>
      {[2.6, 4.4, 6.2].map((y, i) => (
        <Anim key={y} clock={clock} update={(g, t) => (g.rotation.y = t * (0.6 + i * 0.25) * (i % 2 ? -1 : 1))}>
          <Solid kind="torus" p={[0, y, -1.5]} s={[3.6, 3.6, 3.6]} rot={[Math.PI / 2, 0, 0]} c={[PAL.cyan, PAL.amber, PAL.violet][i]} glow={0.9} />
        </Anim>
      ))}
      <Anim clock={clock} update={(g, t) => ((g.rotation.y = t * 1.2), (g.position.y = 8.9 + Math.sin(t * 2) * 0.12))}>
        <Solid kind="octa" s={1.5} c={PAL.amber} glow={1.2} />
      </Anim>
      <Anim clock={clock} update={(g, t) => ((g.visible = t > 1.4), (g.position.y = 0))}>
        <Label text="ARCHITECT" p={[0, 10.5, -1.5]} w={4.2} h={0.9} font={64} accent={PAL.amber} />
      </Anim>
      <FilmChibi clock={clock} pose={pose} />
    </group>
  );
}

/* ------------------------------------------------------------- scene B */

const PRICES = ["$0.80", "$0.55", "$0.20", "$0.65"];
const PROV_H = [2.8, 1.9, 1.3, 2.3];
const PROV_Z = [-4.6, -1.5, 1.6, 4.7];

function SceneB({ clock }: { clock: Clock }) {
  const T0 = STARTS[1];
  const app: V3 = [-6, 1.1, 2];
  const gate: V3 = [0, 2.1, 0];
  const prov = (i: number): V3 => [6.4, PROV_H[i] + 0.6, PROV_Z[i]];
  const cheapest = 2;
  const pose = (t: number): Pose => ({
    x: -8.3,
    z: 0.4,
    ry: 1.15,
    sit: false,
    bob: Math.abs(Math.sin(t * 5)) * 0.015,
    armL: [-1.25 + Math.sin(t * 11) * 0.12, 0.2],
    armR: [-1.25 - Math.sin(t * 11) * 0.12, -0.2],
    headX: 0.1,
  });
  const modal: { kind: "box" | "octa" | "cone" | "torus" | "ico"; c: string; label: string }[] = [
    { kind: "box", c: PAL.cyan, label: "text" },
    { kind: "octa", c: PAL.pink, label: "image" },
    { kind: "cone", c: PAL.amber, label: "speech" },
    { kind: "ico", c: PAL.violet, label: "video" },
    { kind: "torus", c: PAL.green, label: "transcribe" },
  ];
  return (
    <group>
      <Island r={11.5} />
      {/* your app: a laptop */}
      <Pop clock={clock} t0={T0 + 0.2}>
        <Solid p={[-6.2, 0.1, 1.4]} s={[2.4, 0.2, 1.7]} c={PAL.slate3} />
        <Solid p={[-6.2, 1.1, 0.7]} s={[2.4, 1.7, 0.12]} c={PAL.slate} rot={[-0.18, 0, 0]} />
        <Solid p={[-6.2, 1.1, 0.78]} s={[2.1, 1.4, 0.04]} c={PAL.cyan} glow={0.8} rot={[-0.18, 0, 0]} />
        <Label text="Your app" p={[-6.2, 3, 1]} w={1.9} h={0.55} accent={PAL.cyan} />
      </Pop>
      <FilmChibi clock={clock} pose={pose} />

      {/* the gateway */}
      <Pop clock={clock} t0={T0 + 0.6}>
        <Solid kind="cyl" p={[0, 0.3, 0]} s={[2.6, 0.6, 2.6]} c={PAL.slate3} sides={6} />
        <Anim clock={clock} update={(g, t) => ((g.rotation.y = t * 0.8), (g.position.y = 2.2 + Math.sin(t * 1.6) * 0.1))}>
          <Solid kind="ico" s={2.5} c={PAL.violet} glow={0.55} />
        </Anim>
        <Anim clock={clock} update={(g, t) => (g.rotation.y = -t * 1.1)}>
          <Solid kind="torus" p={[0, 2.2, 0]} s={[4.2, 4.2, 4.2]} rot={[Math.PI / 2.4, 0, 0]} c={PAL.cyan} glow={0.8} />
        </Anim>
        <Label text="Gateway" p={[0, 4.6, 0]} w={2.1} h={0.58} accent={PAL.violet} />
      </Pop>

      {/* providers, each with a price */}
      {PROV_H.map((h, i) => (
        <Pop key={i} clock={clock} t0={T0 + 1.0 + i * 0.25}>
          <group position={[6.4, 0, PROV_Z[i]]}>
            <Solid p={[0, h / 2, 0]} s={[1.5, h, 1.5]} c={PAL.slate3} />
            <Anim clock={clock} update={(g, t) => {
              const win = i === cheapest && t > T0 + 7 ? 1 : 0;
              g.scale.setScalar(1 + win * (0.08 + Math.sin(t * 6) * 0.04));
            }}>
              <Solid p={[0, h + 0.15, 0]} s={[1.7, 0.3, 1.7]} c={i === cheapest ? PAL.green : [PAL.amber, PAL.orange, PAL.pink, PAL.cyan][i]} glow={i === cheapest ? 1 : 0.5} />
            </Anim>
            <Label text={PRICES[i]} p={[0, h + 1.1, 0]} w={1.5} h={0.5} bg={i === cheapest ? "#064e3b" : "#0b1220"} fg={i === cheapest ? "#6ee7b7" : "#e2e8f0"} />
          </group>
        </Pop>
      ))}
      <Anim clock={clock} update={(g, t) => ((g.visible = t > T0 + 7.2), (g.position.y = Math.sin(t * 3) * 0.08))}>
        <Label text="cheapest that fits" p={[6.4, 5, PROV_Z[cheapest]]} w={2.6} h={0.55} bg="#064e3b" fg="#6ee7b7" />
      </Anim>

      {/* requests flowing in, fanning out to bids, then to the winner */}
      <Flow clock={clock} route={[app, [-3, 1.8, 0.6], gate]} from={T0 + 1.2} to={T0 + 13} c={PAL.cyan} count={4} period={1.4} />
      {PROV_Z.map((z, i) => (
        <Flow key={i} clock={clock} route={[gate, prov(i)]} from={T0 + 2.6 + i * 0.2} to={T0 + 6.6} c={[PAL.amber, PAL.orange, PAL.pink, PAL.cyan][i]} count={2} period={1.6} size={0.22} kind="octa" />
      ))}
      <Flow clock={clock} route={[gate, prov(cheapest)]} from={T0 + 7.2} to={T0 + 13} c={PAL.green} count={3} period={1.2} size={0.34} />
      <Flow clock={clock} route={[prov(cheapest), [3, 2.6, 0.9], gate, [-3, 1.8, 0.6], app]} from={T0 + 8.4} to={T0 + 13} c={PAL.amber} count={3} period={2.4} size={0.26} kind="sphere" />

      {/* every modality orbits the gateway */}
      {modal.map((m, i) => (
        <Anim
          key={m.label}
          clock={clock}
          update={(g, t) => {
            const on = seg(t, T0 + 3.0, T0 + 3.6) * (1 - seg(t, T0 + 6.8, T0 + 7.3));
            g.visible = on > 0.01;
            g.scale.setScalar(Math.max(0.001, on));
            const a = t * 0.9 + (i / modal.length) * Math.PI * 2;
            g.position.set(Math.cos(a) * 3.1, 2.2 + Math.sin(a * 2) * 0.35, Math.sin(a) * 3.1);
          }}
        >
          <Solid kind={m.kind} s={0.62} c={m.c} glow={0.8} />
          <Label text={m.label} p={[0, -0.7, 0]} w={1.4} h={0.38} font={50} />
        </Anim>
      ))}

      {/* bring your own key */}
      <Anim
        clock={clock}
        update={(g, t) => {
          const k = seg(t, T0 + 10.6, T0 + 12.2);
          g.visible = k > 0 && t < T0 + 12.9;
          const p = lerp3([-6.2, 4, 1.4], [0, 2.2, 0], ease(k));
          g.position.set(p[0], p[1] + Math.sin(k * Math.PI) * 0.8, p[2]);
          g.rotation.z = Math.sin(t * 4) * 0.3;
          g.scale.setScalar(1 - seg(t, T0 + 12.2, T0 + 12.9) * 0.9);
        }}
      >
        <Solid kind="torus" p={[-0.3, 0, 0]} s={0.7} c={PAL.amber} glow={1} />
        <Solid p={[0.3, 0, 0]} s={[0.8, 0.12, 0.12]} c={PAL.amber} glow={1} />
        <Solid p={[0.52, -0.12, 0]} s={[0.12, 0.2, 0.12]} c={PAL.amber} glow={1} />
        <Label text="your own key" p={[0, 0.8, 0]} w={1.7} h={0.45} bg="#78350f" fg="#fde68a" font={50} />
      </Anim>
    </group>
  );
}

/* ------------------------------------------------------------- scene C */

function Candles({ clock }: { clock: Clock }) {
  const n = 9;
  return (
    <group>
      <Solid p={[0, 0.18, 0]} s={[1.6, 0.36, 8.4]} c={PAL.slate3} />
      {Array.from({ length: n }, (_, i) => (
        <Anim
          key={i}
          clock={clock}
          update={(g, t) => {
            const h = 0.8 + 1.4 * (0.5 + 0.5 * Math.sin(t * 1.4 + i * 0.9)) + i * 0.12;
            g.scale.y = h;
            g.position.y = 0.36;
          }}
        >
          <Solid p={[0, 0.5, -3.6 + i * 0.9]} s={[0.62, 1, 0.62]} c={i % 3 === 1 ? PAL.red : PAL.green} glow={0.45} />
        </Anim>
      ))}
    </group>
  );
}

function SceneC({ clock }: { clock: Clock }) {
  const T0 = STARTS[2];
  const traders: V3[] = [[-8, 0.9, -3.2], [-8, 0.9, 0], [-8, 0.9, 3.2]];
  const oms: V3 = [-3, 1.2, 0];
  const risk: V3 = [1.8, 1.6, 0];
  const book: V3 = [6.8, 1.2, 0];
  const pose = (t: number): Pose => ({
    x: -4.8,
    z: 4.6,
    ry: -0.9 + Math.sin(t * 0.5) * 0.1,
    armL: [-0.1, 0.1],
    armR: [-1.2 + Math.sin(t * 2) * 0.05, -0.5],
    headZ: 0.06,
  });
  return (
    <group>
      <Island r={11.5} />
      {/* traders */}
      <Pop clock={clock} t0={T0 + 0.6}>
        {traders.map((p, i) => (
          <group key={i} position={[p[0], 0, p[2]]}>
            <Solid kind="cone" p={[0, 0.55, 0]} s={[0.8, 1.1, 0.8]} c={[PAL.cyan, PAL.pink, PAL.amber][i]} sides={5} />
            <Solid kind="ico" p={[0, 1.35, 0]} s={0.55} c={PAL.skin} />
            <Solid p={[0.7, 0.8, 0.2]} s={[0.1, 0.55, 0.8]} c={PAL.slate} rot={[0, 0.2, 0]} />
            <Solid p={[0.76, 0.8, 0.2]} s={[0.02, 0.45, 0.68]} c={PAL.cyan} glow={0.8} rot={[0, 0.2, 0]} />
          </group>
        ))}
        <Label text="Traders · React + TS" p={[-8, 3, 0]} w={3} h={0.6} accent={PAL.cyan} font={46} />
      </Pop>

      {/* order management system */}
      <Pop clock={clock} t0={T0 + 3.0}>
        {[0, 1, 2].map((i) => (
          <group key={i}>
            <Solid p={[oms[0], 0.4 + i * 0.6, 0]} s={[2.4, 0.5, 1.9]} c={i % 2 ? PAL.slate3 : "#3b4a63"} />
            <Solid p={[oms[0], 0.4 + i * 0.6, 0.97]} s={[1.9, 0.07, 0.02]} c={PAL.orange} glow={1} />
          </group>
        ))}
        <Anim clock={clock} update={(g, t) => (g.rotation.z = t * 0.9)}>
          <Solid kind="torus" p={[oms[0], 2.6, 0]} s={[1.1, 1.1, 1.1]} c={PAL.orange} glow={0.9} />
        </Anim>
        <Label text="Order management · Rust" p={[oms[0], 4, 0]} w={3.4} h={0.6} accent={PAL.orange} font={44} />
      </Pop>

      {/* risk engine: a shield with a margin gauge that peaks, then liquidates */}
      <Pop clock={clock} t0={T0 + 5.6}>
        <Solid kind="cyl" p={[risk[0], 1.7, 0]} s={[2.2, 3, 0.7]} c={PAL.slate3} sides={6} rot={[Math.PI / 2, 0, 0]} />
        <Solid kind="cyl" p={[risk[0], 1.7, 0.4]} s={[1.5, 2.1, 0.2]} c={PAL.violet} sides={6} glow={0.5} rot={[Math.PI / 2, 0, 0]} />
        <Solid p={[risk[0], 3.55, 0]} s={[2.0, 0.22, 0.22]} c={PAL.slate} />
        <Anim
          clock={clock}
          update={(g, t) => {
            const u = ((t - T0 - 6) % 3.4) / 3.4;
            const fill = u < 0.7 ? u / 0.7 : Math.max(0, 1 - (u - 0.7) / 0.1);
            g.scale.x = Math.max(0.02, fill);
            g.position.x = risk[0] - 1 + fill;
            const m = g.children[0] as unknown as { material: { color: { set: (c: string) => void }; emissive: { set: (c: string) => void } } };
            const c = fill > 0.8 ? PAL.red : fill > 0.55 ? PAL.amber : PAL.green;
            m.material.color.set(c);
            m.material.emissive.set(c);
          }}
        >
          <Solid p={[0.5, 3.55, 0.14]} s={[1, 0.16, 0.16]} c={PAL.green} glow={1} />
        </Anim>
        <Label text="Risk engine" p={[risk[0], 4.7, 0]} w={2.3} h={0.6} accent={PAL.violet} />
      </Pop>

      {/* the book and the market makers */}
      <Pop clock={clock} t0={T0 + 7.2}>
        <group position={[book[0], 0, 0]}>
          <Candles clock={clock} />
        </group>
        <Label text="AX · perpetual futures" p={[book[0], 4.9, 0]} w={3.2} h={0.6} accent={PAL.green} font={46} />
      </Pop>
      <Pop clock={clock} t0={T0 + 9.6}>
        {[-6.4, 6.4].map((z, i) => (
          <group key={i} position={[book[0] + 0.2, 0, z]}>
            <Solid p={[0, 0.9, 0]} s={[1.2, 1.3, 1]} c={PAL.slate3} />
            <Solid p={[0, 1.95, 0]} s={[0.9, 0.7, 0.8]} c={PAL.paper} />
            <Solid p={[0.46, 2.0, 0.1]} s={[0.05, 0.14, 0.14]} c={PAL.cyan} glow={1} />
            <Solid p={[0.46, 2.0, -0.2]} s={[0.05, 0.14, 0.14]} c={PAL.cyan} glow={1} />
            <Solid kind="cyl" p={[0, 2.6, 0]} s={[0.06, 0.6, 0.06]} c={PAL.slate} sides={4} />
            <Solid kind="ico" p={[0, 3.0, 0]} s={0.28} c={PAL.amber} glow={1} />
            {[0, 1, 2].map((k) => (
              <Solid key={k} kind="cyl" p={[1, 0.15 + k * 0.22, 0]} s={[0.7, 0.2, 0.7]} c={PAL.amber} glow={0.5} sides={8} />
            ))}
          </group>
        ))}
        <Label text="Market makers" p={[book[0], 3.7, -6.4]} w={2.6} h={0.55} accent={PAL.amber} />
      </Pop>

      {/* orders flow: traders → OMS → risk → book; liquidity flows in */}
      {traders.map((p, i) => (
        <Flow key={i} clock={clock} route={[[p[0] + 1, 1, p[2]], [-5.2, 1.3, p[2] * 0.3], [oms[0] - 1.3, 1.2, 0]]} from={T0 + 4.0 + i * 0.3} to={T0 + 13} c={[PAL.cyan, PAL.pink, PAL.amber][i]} count={2} period={2} size={0.24} />
      ))}
      <Flow clock={clock} route={[[oms[0] + 1.3, 1.2, 0], [risk[0] - 1.2, 1.7, 0]]} from={T0 + 5} to={T0 + 13} c={PAL.orange} count={3} period={1.5} size={0.26} />
      <Flow clock={clock} route={[[risk[0] + 1.2, 1.7, 0], [book[0] - 1, 1.5, 0]]} from={T0 + 7.3} to={T0 + 13} c={PAL.green} count={3} period={1.5} size={0.26} />
      {[-6.4, 6.4].map((z, i) => (
        <Flow key={i} clock={clock} route={[[book[0] + 0.2, 1.6, z * 0.92], [book[0], 1.6, z * 0.45]]} from={T0 + 10.2} to={T0 + 13} c={PAL.amber} count={3} period={1.3} size={0.2} kind="sphere" />
      ))}
      <FilmChibi clock={clock} pose={pose} />
    </group>
  );
}

/* ------------------------------------------------------------- scene D */

function SceneD({ clock }: { clock: Clock }) {
  const T0 = STARTS[3];
  const pillars = [
    { x: -3.8, h: 1.7, big: "0 → 1", small: "Liquid Inference", c: PAL.cyan },
    { x: 0, h: 2.4, big: "BYOK", small: "plus auto routing", c: PAL.amber },
    { x: 3.8, h: 1.7, big: "AX", small: "risk, OMS, MM program", c: PAL.green },
  ];
  const pose = (t: number): Pose => {
    const k = seg(t, T0 + 0.6, T0 + 1.6);
    const hop = Math.max(0, Math.sin((t - T0) * 5)) * 0.35 * k;
    return {
      x: 0,
      y: 2.4 + hop,
      z: 0,
      ry: 0.35,
      armL: [0, -2.7 + Math.sin(t * 9) * 0.2],
      armR: [0, 2.7 - Math.sin(t * 9) * 0.2],
      legs: Math.sin(t * 9) * 0.25 * k,
      headZ: Math.sin(t * 4.5) * 0.08,
    };
  };
  return (
    <group>
      <Island r={11} />
      {pillars.map((p, i) => (
        <Pop key={i} clock={clock} t0={T0 + 0.3 + i * 0.35}>
          <Solid kind="cyl" p={[p.x, p.h / 2 + 0.1, -0.4]} s={[2.8, p.h, 2.8]} c={PAL.slate3} sides={6} />
          <Solid kind="cyl" p={[p.x, p.h + 0.15, -0.4]} s={[2.9, 0.22, 2.9]} c={p.c} sides={6} glow={0.9} />
          <Label text={p.big} p={[p.x, p.h + 2.2 + (i === 1 ? 1.1 : 0), -0.4]} w={2.3} h={0.8} font={68} accent={p.c} />
          <Label text={p.small} p={[p.x, p.h + 1.45 + (i === 1 ? 1.1 : 0), -0.4]} w={2.5} h={0.42} font={42} bg="#111a2c" fg="#cbd5e1" />
        </Pop>
      ))}
      <Anim clock={clock} update={(g, t) => (g.position.y = Math.max(0, 0) + Math.sin(t * 2) * 0.05)}>
        <Label text="Architect · 2026 –" p={[0, 8.4, -2]} w={4.4} h={0.8} font={60} accent={PAL.amber} />
      </Anim>
      <FilmChibi clock={clock} pose={pose} scale={1.35} />
      <Confetti clock={clock} center={[0, 0, 0]} on={T0 + 1.4} />
    </group>
  );
}

/* -------------------------------------------------------- camera + root */

const CAM: { pos: V3; look: V3 }[] = [
  { pos: [8.5, 6.8, 14.5], look: [0, 2.4, -0.5] },
  { pos: [9, 7, 15.5], look: [0, 0.9, 0] },
  { pos: [9, 7.2, 16.5], look: [0, 0.9, 0] },
  { pos: [7.5, 6.2, 13], look: [0, 2.1, -0.4] },
];

function CameraRig({ clock }: { clock: Clock }) {
  const { camera } = useThree();
  const look = useRef(new Vector3());
  useFrame(() => {
    const t = clock.current;
    // which diorama are we in, and how far through the glide to the next one?
    let cur = 0;
    STARTS.forEach((s, i) => {
      if (t >= s) cur = i;
    });
    const nxt = Math.min(cur + 1, STARTS.length - 1);
    const g = nxt === cur ? 0 : ease(seg(t, STARTS[nxt] - 1.6, STARTS[nxt]));
    const pf = lerp3(addX(CAM[cur].pos, cur * STEP), addX(CAM[nxt].pos, nxt * STEP), g);
    const lf = lerp3(addX(CAM[cur].look, cur * STEP), addX(CAM[nxt].look, nxt * STEP), g);
    const sway = Math.sin(t * 0.35) * 0.9;
    camera.position.set(pf[0] + sway, pf[1] + Math.sin(g * Math.PI) * 2.5, pf[2]);
    look.current.set(lf[0], lf[1], lf[2]);
    camera.lookAt(look.current);
  });
  return null;
}

const addX = (p: V3, x: number): V3 => [p[0] + x, p[1], p[2]];

function ArchitectScene({ clock }: { clock: Clock }) {
  return (
    <>
      <color attach="background" args={[PAL.ink]} />
      <fog attach="fog" args={[PAL.ink, 28, 70]} />
      <hemisphereLight args={["#bcd3ff", "#1a1630", 0.9]} />
      <directionalLight position={[10, 16, 12]} intensity={2.1} color="#fff1dc" />
      <directionalLight position={[-12, 6, -8]} intensity={0.7} color="#7aa2ff" />
      <CameraRig clock={clock} />
      <group position={at(0)}>
        <SceneA clock={clock} />
      </group>
      <group position={at(1)}>
        <SceneB clock={clock} />
      </group>
      <group position={at(2)}>
        <SceneC clock={clock} />
      </group>
      <group position={at(3)}>
        <SceneD clock={clock} />
      </group>
    </>
  );
}
