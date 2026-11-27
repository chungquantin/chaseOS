"use client";

import { useMemo } from "react";
import { Anim, ease, easeOut, FilmChibi, Island, Label, lerp, lerp3, PAL, seg, Solid, type Clock, type Pose, type V3 } from "./lowpoly";
import { Beam, Burst, Dust, DocGlyph, Gear, MicGlyph, PicGlyph, Pop, Pulse, Ticker, VideoGlyph, WaveGlyph } from "./props";
import { B, E, Flow, Link, typing, walk } from "./kit";

/* ============================================================ scene A */

function Skyline({ clock }: { clock: Clock }) {
  const towers = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const a = i * 0.255 + 0.4;
        const r = 5.4 + (i % 4) * 1.5;
        const h = 2.2 + ((i * 7) % 6) * 0.95;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r - 1.2, h, w: 1.0 + (i % 3) * 0.3, c: [PAL.slate2, PAL.slate3, "#3b4a63", "#2a3a55"][i % 4], lit: [PAL.cyan, PAL.amber, "#fef3c7"][i % 3], i };
      }).filter((t) => !(t.z > 2 && Math.abs(t.x) < 3.8)),
    []
  );
  return (
    <group>
      {towers.map((t) => (
        <group key={t.i} position={[t.x, 0, t.z]}>
          <Anim clock={clock} update={(g, time) => g.scale.set(1, Math.max(0.001, easeOut(seg(time, 0.2 + t.i * 0.06, 1.6 + t.i * 0.06))), 1)}>
            <Solid p={[0, t.h / 2, 0]} s={[t.w, t.h, t.w]} c={t.c} />
            <Solid p={[0, t.h + 0.12, 0]} s={[t.w * 1.08, 0.24, t.w * 1.08]} c={PAL.slate} />
            {Array.from({ length: Math.floor(t.h / 0.8) }, (_, r) => (
              <Anim key={r} clock={clock} update={(g, time) => (g.visible = Math.sin(time * 0.7 + t.i * 3.1 + r * 1.9) > -0.55)}>
                <Solid p={[0, 0.7 + r * 0.8, t.w / 2 + 0.01]} s={[t.w * 0.62, 0.12, 0.02]} c={t.lit} glow={1.2} shadow={false} />
              </Anim>
            ))}
          </Anim>
        </group>
      ))}
    </group>
  );
}

function Car({ clock, i }: { clock: Clock; i: number }) {
  return (
    <Anim
      clock={clock}
      update={(g, t) => {
        const a = t * 0.32 + (i * Math.PI) / 2;
        g.position.set(Math.cos(a) * 8.3, 0.22, Math.sin(a) * 8.3 - 1.2);
        g.rotation.y = -a;
      }}
    >
      <Solid p={[0, 0, 0]} s={[0.5, 0.3, 0.9]} c={[PAL.red, PAL.cyan, PAL.amber, PAL.paper][i]} />
      <Solid p={[0, 0.2, -0.05]} s={[0.4, 0.2, 0.45]} c={PAL.slate} />
      <Solid p={[-0.15, 0, 0.46]} s={[0.1, 0.1, 0.04]} c="#fff7d6" glow={2} shadow={false} />
      <Solid p={[0.15, 0, 0.46]} s={[0.1, 0.1, 0.04]} c="#fff7d6" glow={2} shadow={false} />
    </Anim>
  );
}

export function SceneA({ clock }: { clock: Clock }) {
  const a1 = B("a1");
  const a2 = B("a2");
  const pose = (t: number): Pose => {
    const w = walk(t, 1.0, 7.0, [-9, 0, 10.5], [-1.4, 0, 5.4]);
    const wave = seg(t, 7.1, 7.4) * (1 - seg(t, 8.5, 8.8));
    const face = seg(t, 8.5, 9.2);
    if (t < 7.0) return w;
    return {
      ...w,
      ry: lerp(lerp(w.ry ?? 0, 0.55, seg(t, 7.0, 7.4)), 0.35, face),
      armL: [lerp(0, -0.1, face), lerp(0.08, -2.4 + Math.sin(t * 8) * 0.3, wave) + face * -0.7],
      armR: [0, lerp(-0.08, 0.7, face)],
      headX: -0.12 * (1 - face),
      headZ: 0.06,
    };
  };
  return (
    <group>
      <Island r={12} />
      {/* roads: a ring and the way in */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, -1.2]} receiveShadow>
        <ringGeometry args={[7.6, 9.0, 56]} />
        <meshStandardMaterial color="#18202f" roughness={0.9} />
      </mesh>
      <Solid p={[0, 0.07, 5.4]} s={[2.6, 0.04, 9.5]} c="#1b2536" shadow={false} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Solid key={i} p={[0, 0.1, 1.6 + i * 1.8]} s={[0.1, 0.01, 0.8]} c="#e2e8f0" shadow={false} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Car key={i} clock={clock} i={i} />
      ))}
      <Skyline clock={clock} />
      <Dust r={10} />

      {/* the exchange: a glass tower with a beacon */}
      <Anim clock={clock} update={(g, t) => (g.scale.y = Math.max(0.001, easeOut(seg(t, 0.2, 2.2))))}>
        <Solid kind="cyl" p={[0, 0.6, -1.5]} s={[3.6, 1.2, 3.6]} c={PAL.slate2} sides={6} />
        <Solid kind="cyl" p={[0, 4.2, -1.5]} s={[2.4, 6.8, 2.4]} c={PAL.slate3} sides={6} />
        <Solid kind="cyl" p={[0, 4.2, -1.5]} s={[2.55, 5.2, 2.55]} c={PAL.cyan} sides={6} opacity={0.3} glow={0.3} shadow={false} />
        <Solid kind="cyl" p={[0, 7.9, -1.5]} s={[1.5, 1.2, 1.5]} c={PAL.slate} sides={6} />
      </Anim>
      {[2.6, 4.4, 6.2].map((y, i) => (
        <Anim key={y} clock={clock} update={(g, t) => (g.rotation.y = t * (0.6 + i * 0.25) * (i % 2 ? -1 : 1))}>
          <Solid kind="torus" tube={0.035} p={[0, y, -1.5]} s={[3.8, 3.8, 3.8]} rot={[Math.PI / 2, 0, 0]} c={[PAL.cyan, PAL.amber, PAL.violet][i]} glow={1.6} shadow={false} />
        </Anim>
      ))}
      <Anim clock={clock} update={(g, t) => ((g.rotation.y = t * 1.2), (g.position.y = 9.4 + Math.sin(t * 2) * 0.15))}>
        <Solid kind="octa" s={1.6} c={PAL.amber} glow={1.8} shadow={false} />
      </Anim>
      <Anim clock={clock} update={(g, t) => (g.visible = t > 1.8)}>
        <Beam p={[0, 15, -1.5]} r={1.6} h={11} opacity={0.12} />
      </Anim>

      {/* the gate you walk through */}
      <Pop clock={clock} t0={1.2}>
        {[-1.4, 1.4].map((x) => (
          <Solid key={x} p={[x, 1.4, 5.4]} s={[0.35, 2.8, 0.35]} c={PAL.slate3} />
        ))}
        <Solid p={[0, 2.95, 5.4]} s={[3.5, 0.4, 0.45]} c={PAL.slate3} />
        <Solid p={[0, 2.95, 5.65]} s={[3.1, 0.1, 0.05]} c={PAL.amber} glow={1.6} shadow={false} />
        <Label text="ARCHITECT" p={[0, 4.0, 5.4]} w={4.2} h={0.9} font={64} accent={PAL.amber} />
      </Pop>

      <Pop clock={clock} t0={a1 + 3.6} dur={0.8}>
        <Label text="the intelligence exchange" p={[0, 11.2, -1.5]} w={4.6} h={0.62} font={42} bg="#111a2c" fg="#cbd5e1" />
      </Pop>

      {/* he joined: what he brings */}
      <Pop clock={clock} t0={a2 + 1.0} t1={E("a2") + 0.5}>
        <Anim clock={clock} update={(g, t) => g.position.set(-3.9, 2.9 + Math.sin(t * 2) * 0.1, 5.4)}>
          <Anim clock={clock} update={(g, t) => (g.rotation.y = t * 0.8)}>
            <Gear r={0.5} />
          </Anim>
          <Label text="Rust" p={[0, 0.95, 0]} w={1.1} h={0.45} accent={PAL.orange} font={52} />
        </Anim>
      </Pop>
      <Pop clock={clock} t0={a2 + 2.6} t1={E("a2") + 0.5}>
        <Anim clock={clock} update={(g, t) => g.position.set(1.0, 2.9 + Math.sin(t * 2 + 1) * 0.1, 5.4)}>
          <Anim clock={clock} update={(g, t) => (g.rotation.y = -t * 0.7)}>
            <Solid s={[0.8, 0.8, 0.8]} c="#2563eb" glow={0.6} />
          </Anim>
          <Label text="TypeScript" p={[0, 0.95, 0]} w={1.6} h={0.45} accent={PAL.cyan} font={46} />
        </Anim>
      </Pop>

      <FilmChibi clock={clock} pose={pose} />
    </group>
  );
}

/* ============================================================ scene B */

const PRICE_SEQ = [
  ["$0.80", "$0.82", "$0.79", "$0.78", "$0.78"],
  ["$0.70", "$0.64", "$0.60", "$0.57", "$0.55"],
  ["$0.60", "$0.45", "$0.31", "$0.24", "$0.20"],
  ["$0.90", "$0.78", "$0.72", "$0.68", "$0.65"],
];
const PROV_H = [2.8, 1.9, 1.3, 2.3];
const PROV_Z = [-4.6, -1.5, 1.6, 4.7];
const CHEAP = 2;

export function SceneB({ clock }: { clock: Clock }) {
  const b1 = B("b1");
  const b2 = B("b2");
  const b3 = B("b3");
  const b4 = B("b4");
  const app: V3 = [-6, 1.2, 2];
  const gate: V3 = [0, 2.3, 0];
  const prov = (i: number): V3 => [6.4, PROV_H[i] + 0.7, PROV_Z[i]];
  const win = b3 + 4.8;

  const pose = (t: number): Pose => {
    const base = typing(t, -8.3, 0.4, 1.15);
    const jump = seg(t, win, win + 0.4) * (1 - seg(t, win + 1.5, win + 1.9));
    if (jump <= 0) return base;
    const hop = Math.max(0, Math.sin((t - win) * 7)) * 0.35 * jump;
    return { ...base, y: hop, armL: [0, -2.7 + Math.sin(t * 10) * 0.2], armR: [0, 2.7 - Math.sin(t * 10) * 0.2], headX: -0.1, ry: lerp(1.15, 0.5, jump) };
  };

  // the gateway assembles from loose parts
  const shards = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const e = Math.acos(1 - ((i * 37) % 16) / 8);
        return {
          from: [Math.cos(a) * 7, 6 + (i % 4), Math.sin(a) * 7 - 1] as V3,
          to: [Math.sin(e) * Math.cos(a * 3) * 1.1, 2.3 + Math.cos(e) * 1.1, Math.sin(e) * Math.sin(a * 3) * 1.1] as V3,
          i,
        };
      }),
    []
  );

  const modal: { id: string; label: string; c: string; glyph: JSX.Element }[] = [
    { id: "text", label: "text", c: PAL.cyan, glyph: <DocGlyph /> },
    { id: "image", label: "image", c: PAL.amber, glyph: <PicGlyph /> },
    { id: "speech", label: "speech", c: PAL.pink, glyph: <WaveGlyph clock={clock} /> },
    { id: "video", label: "video", c: PAL.violet, glyph: <VideoGlyph /> },
    { id: "transcribe", label: "transcription", c: PAL.green, glyph: <MicGlyph /> },
  ];
  // five stations in a gentle arc behind the gateway
  const stationPos = (i: number): V3 => [-4.8 + i * 2.4, 2.7 + Math.sin(i * 1.7) * 0.25, -3.4 + Math.abs(i - 2) * 0.55];

  return (
    <group>
      <Island r={12.5} />
      <Dust r={11} c="#c4b5fd" />

      {/* your app: a laptop, with code streaming across the screen */}
      <Pop clock={clock} t0={b1 - 0.4}>
        <Solid p={[-6.2, 0.1, 1.4]} s={[2.6, 0.2, 1.8]} c={PAL.slate3} />
        <Solid p={[-6.2, 0.22, 1.7]} s={[2.0, 0.04, 0.7]} c={PAL.slate} />
        <group position={[-6.2, 1.15, 0.7]} rotation={[-0.18, 0, 0]}>
          <Solid s={[2.6, 1.8, 0.12]} c={PAL.slate} />
          <Solid p={[0, 0, 0.07]} s={[2.3, 1.5, 0.03]} c="#071225" />
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <Anim key={r} clock={clock} update={(g, t) => (g.scale.x = 0.3 + 0.7 * Math.abs(Math.sin(t * 2.2 + r * 1.3)))}>
              <Solid p={[-0.9, 0.55 - r * 0.22, 0.1]} s={[1.5, 0.07, 0.02]} c={[PAL.cyan, PAL.green, PAL.amber][r % 3]} glow={1.2} shadow={false} />
            </Anim>
          ))}
        </group>
        <Label text="Your app" p={[-6.2, 3.2, 1]} w={1.9} h={0.55} accent={PAL.cyan} />
      </Pop>
      <FilmChibi clock={clock} pose={pose} />

      {/* "0": nothing yet. Then the gateway is built from loose parts */}
      <Pop clock={clock} t0={b1 + 0.2} t1={b1 + 3.6}>
        <Label text="0" p={[0, 6, 0]} w={1.3} h={1.2} font={110} bg="#0f1a33" fg="#93c5fd" />
      </Pop>
      <Pop clock={clock} t0={b1 + 3.9} t1={b1 + 7.5}>
        <Label text="1" p={[0, 6, 0]} w={1.3} h={1.2} font={110} bg="#052e24" fg="#6ee7b7" />
      </Pop>
      {shards.map((s) => (
        <Anim
          key={s.i}
          clock={clock}
          update={(g, t) => {
            const k = ease(seg(t, b1 + 0.5 + s.i * 0.08, b1 + 3.3));
            g.visible = t > b1 + 0.3 && t < b1 + 3.5;
            const p = lerp3(s.from, s.to, k);
            g.position.set(p[0], p[1], p[2]);
            g.rotation.set(t * 3 + s.i, t * 2, 0);
          }}
        >
          <Solid kind="tetra" s={0.5} c={PAL.violet} glow={1} shadow={false} />
        </Anim>
      ))}
      <Pulse clock={clock} p={[0, 0.2, 0]} from={b1 + 3.5} dur={1.3} c={PAL.violet} max={4.5} />

      <Pop clock={clock} t0={b1 + 3.4} dur={0.9}>
        <Solid kind="cyl" p={[0, 0.3, 0]} s={[2.8, 0.6, 2.8]} c={PAL.slate3} sides={6} />
        <Anim clock={clock} update={(g, t) => ((g.rotation.y = t * 0.8), (g.position.y = 2.3 + Math.sin(t * 1.6) * 0.1))}>
          <Solid kind="ico" s={2.6} c={PAL.violet} glow={0.9} />
          <Solid kind="ico" s={1.4} c={PAL.paper} glow={1.4} shadow={false} />
        </Anim>
        <Anim clock={clock} update={(g, t) => (g.rotation.y = -t * 1.1)}>
          <Solid kind="torus" tube={0.03} p={[0, 2.3, 0]} s={[4.6, 4.6, 4.6]} rot={[Math.PI / 2.4, 0, 0]} c={PAL.cyan} glow={1.8} shadow={false} />
        </Anim>
        <Label text="Gateway" p={[0, 4.9, 0]} w={2.1} h={0.58} accent={PAL.violet} />
      </Pop>

      {/* providers, each with a price that moves */}
      {PROV_H.map((h, i) => (
        <Pop key={i} clock={clock} t0={b1 + 4.2 + i * 0.4}>
          <group position={[6.4, 0, PROV_Z[i]]}>
            <Solid p={[0, h / 2, 0]} s={[1.5, h, 1.5]} c={PAL.slate3} />
            {[0.3, 0.55, 0.8].map((f) => (
              <Solid key={f} p={[0, h * f, 0.76]} s={[1.0, 0.09, 0.02]} c={PAL.cyan} glow={1} shadow={false} />
            ))}
            <Anim
              clock={clock}
              update={(g, t) => {
                const w = i === CHEAP && t > win ? 1 : 0;
                g.scale.setScalar(1 + w * (0.08 + Math.sin(t * 6) * 0.04));
              }}
            >
              <Solid p={[0, h + 0.15, 0]} s={[1.7, 0.3, 1.7]} c={i === CHEAP ? PAL.green : [PAL.amber, PAL.orange, PAL.pink, PAL.cyan][i]} glow={i === CHEAP ? 1.4 : 0.7} />
            </Anim>
            <Ticker clock={clock} p={[0, h + 1.1, 0]} values={PRICE_SEQ[i]} from={b3 + 0.3} to={b3 + 4.6} w={1.5} h={0.5} last={i === CHEAP ? { bg: "#064e3b", fg: "#6ee7b7" } : undefined} />
          </group>
        </Pop>
      ))}
      <Pop clock={clock} t0={win + 0.2}>
        <Anim clock={clock} update={(g, t) => (g.position.y = Math.sin(t * 3) * 0.08)}>
          <Solid kind="cone" p={[6.4, 4.4, PROV_Z[CHEAP]]} s={[0.9, 0.8, 0.9]} c={PAL.amber} sides={5} glow={1.6} />
          <Label text="cheapest that fits" p={[6.4, 5.5, PROV_Z[CHEAP]]} w={2.6} h={0.55} bg="#064e3b" fg="#6ee7b7" />
        </Anim>
      </Pop>

      {/* every modality gets its own little station */}
      {modal.map((m, i) => (
        <Pop key={m.id} clock={clock} t0={b2 + 0.2 + i * 0.95} t1={b3 + 0.6}>
          <Anim clock={clock} update={(g, t) => { const p = stationPos(i); g.position.set(p[0], p[1] + Math.sin(t * 1.5 + i) * 0.12, p[2]); }}>
            <Solid kind="cyl" p={[0, -0.78, 0]} s={[1.3, 0.14, 1.3]} c={m.c} sides={6} glow={0.9} />
            <Anim clock={clock} update={(g, t) => (g.rotation.y = Math.sin(t * 0.8 + i) * 0.5)}>{m.glyph}</Anim>
            <Label text={m.label} p={[0, -1.3, 0]} w={1.7} h={0.42} font={48} accent={m.c} />
          </Anim>
          <Link clock={clock} a={stationPos(i)} b={gate} t0={b2 + 0.4 + i * 0.95} t1={b3 + 0.4} c={m.c} w={0.04} flicker />
        </Pop>
      ))}

      {/* requests in, bids out, the winner takes it */}
      <Flow clock={clock} route={[app, [-3, 1.9, 0.6], gate]} from={b1 + 5.2} to={E("b4")} c={PAL.cyan} count={4} period={1.5} />
      {PROV_Z.map((z, i) => (
        <Flow key={i} clock={clock} route={[gate, prov(i)]} from={b3 + 0.5 + i * 0.25} to={b3 + 4.6} c={[PAL.amber, PAL.orange, PAL.pink, PAL.cyan][i]} count={2} period={1.7} size={0.22} kind="octa" />
      ))}
      {PROV_Z.map((z, i) => (
        <Link key={`s${i}`} clock={clock} a={gate} b={prov(i)} t0={b3 + 0.4 + i * 0.35} t1={b3 + 0.9 + i * 0.35} c={i === CHEAP ? PAL.green : PAL.slate3} w={0.06} />
      ))}
      <Flow clock={clock} route={[gate, prov(CHEAP)]} from={win} to={E("b4")} c={PAL.green} count={3} period={1.2} size={0.34} />
      <Flow clock={clock} route={[prov(CHEAP), [3, 2.8, 0.9], gate, [-3, 1.9, 0.6], app]} from={win + 1.2} to={E("b4")} c={PAL.amber} count={3} period={2.6} size={0.26} kind="sphere" />

      {/* bring your own key, spend caps, a receipt for every request */}
      <Anim
        clock={clock}
        update={(g, t) => {
          const k = seg(t, b4 + 0.2, b4 + 1.8);
          g.visible = k > 0 && t < b4 + 2.4;
          const p = lerp3([-6.2, 4.2, 1.4], [0, 2.3, 0], ease(k));
          g.position.set(p[0], p[1] + Math.sin(k * Math.PI) * 0.9, p[2]);
          g.rotation.z = Math.sin(t * 4) * 0.3;
          g.scale.setScalar(1 - seg(t, b4 + 1.8, b4 + 2.4) * 0.9);
        }}
      >
        <Solid kind="torus" p={[-0.3, 0, 0]} s={0.7} c={PAL.amber} glow={1.5} />
        <Solid p={[0.3, 0, 0]} s={[0.8, 0.12, 0.12]} c={PAL.amber} glow={1.5} />
        <Solid p={[0.52, -0.12, 0]} s={[0.12, 0.2, 0.12]} c={PAL.amber} glow={1.5} />
        <Label text="your own key" p={[0, 0.8, 0]} w={1.7} h={0.45} bg="#78350f" fg="#fde68a" font={50} />
      </Anim>
      <Pulse clock={clock} p={[0, 0.2, 0]} from={b4 + 1.9} dur={1.2} c={PAL.amber} max={4} />
      <Pop clock={clock} t0={b4 + 1.4}>
        <group position={[-2.2, 0, 4.6]}>
          <Solid p={[0, 0.9, 0]} s={[2.4, 1.5, 0.15]} c={PAL.slate} />
          <Solid p={[0, 0.6, 0.1]} s={[2.0, 0.22, 0.05]} c="#0b1a33" />
          <Anim clock={clock} update={(g, t) => ((g.scale.x = 0.05 + 0.6 * ease(seg(t, b4 + 1.8, b4 + 3.6))), (g.position.x = -1 + (0.05 + 0.6 * ease(seg(t, b4 + 1.8, b4 + 3.6))) * 1))}>
            <Solid p={[0.5, 0.6, 0.14]} s={[1.0, 0.16, 0.05]} c={PAL.green} glow={1.4} shadow={false} />
          </Anim>
          <Label text="spend cap" p={[0, 2.0, 0]} w={1.8} h={0.5} accent={PAL.green} />
        </group>
      </Pop>
      {[0, 1, 2, 3].map((i) => (
        <Anim
          key={i}
          clock={clock}
          update={(g, t) => {
            const u = ((t - (b4 + 1.9 + i * 0.55)) % 2.4) / 2.4;
            const on = t > b4 + 1.9 + i * 0.55 && t < E("b4") + 0.8;
            g.visible = on;
            const p = lerp3([0.6, 3.2, 0.5], [-5.6, 2.2, 2.6], ease(Math.max(0, u)));
            g.position.set(p[0], p[1] + Math.sin(u * Math.PI) * 1.2, p[2]);
            g.rotation.y = u * 4;
          }}
        >
          <Solid s={[0.55, 0.7, 0.04]} c={PAL.paper} />
          <Solid p={[0, 0.12, 0.03]} s={[0.36, 0.05, 0.01]} c={PAL.slate3} shadow={false} />
          <Solid p={[0, -0.02, 0.03]} s={[0.36, 0.05, 0.01]} c={PAL.slate3} shadow={false} />
          <Solid p={[0, -0.18, 0.03]} s={[0.2, 0.08, 0.01]} c={PAL.green} glow={0.8} shadow={false} />
        </Anim>
      ))}
      <Burst clock={clock} p={[0, 2.3, 0]} from={win} c={PAL.green} count={14} power={2.4} />
    </group>
  );
}
