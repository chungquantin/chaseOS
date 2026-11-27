"use client";

import { Anim, Confetti, ease, easeOut, FilmChibi, Island, Label, lerp, PAL, seg, Solid, type Clock, type Pose, type V3 } from "./lowpoly";
import { Beam, Burst, Dust, Gear, Pop, Pulse } from "./props";
import { B, E, Flow, Link, typing, walk } from "./kit";

/* ============================================================ scene C */

const ASSETS = [
  { name: "Forex", c: PAL.cyan },
  { name: "Equities", c: PAL.green },
  { name: "Commodities", c: PAL.amber },
  { name: "Indices", c: PAL.violet },
];

function Board({ clock, x, c, name, t0, i }: { clock: Clock; x: number; c: string; name: string; t0: number; i: number }) {
  return (
    <Pop clock={clock} t0={t0}>
      <group position={[x, 3.4, -6.6]}>
        <Solid s={[3, 2.2, 0.16]} c={PAL.slate} />
        <Solid p={[0, 0, 0.1]} s={[2.76, 1.96, 0.04]} c="#06101f" />
        {Array.from({ length: 9 }, (_, k) => (
          <Anim key={k} clock={clock} update={(g, t) => (g.scale.y = 0.2 + 0.9 * (0.5 + 0.5 * Math.sin(t * 1.4 + k * 0.8 + i * 2)))}>
            <Solid p={[-1.1 + k * 0.275, -0.6, 0.14]} s={[0.17, 1, 0.03]} c={c} glow={1.1} shadow={false} />
          </Anim>
        ))}
        <Label text={name} p={[0, 1.7, 0.1]} w={2.2} h={0.52} accent={c} />
      </group>
    </Pop>
  );
}

export function SceneC({ clock }: { clock: Clock }) {
  const c1 = B("c1");
  const c2 = B("c2");
  const c3 = B("c3");
  const c4 = B("c4");
  const traders: V3[] = [[-9, 0.9, -3.6], [-9, 0.9, 0], [-9, 0.9, 3.6]];
  const oms: V3 = [-4, 1.2, 0];
  const risk: V3 = [1.2, 1.6, 0];
  const book: V3 = [7.4, 1.2, 0];
  const liq = c3 + 3.3;

  const pose = (t: number): Pose => {
    if (t < c2 - 0.4) {
      // c1: stands in the plaza, gesturing up at the boards
      return { x: -1, z: 4.6, ry: 0.4, armL: [0, -2.2 + Math.sin(t * 3) * 0.2], armR: [-0.2, 0.1], headX: -0.15 };
    }
    if (t < c3 - 0.4) {
      // c2: at the OMS console, typing fast
      const w = walk(t, c2 - 0.4, c2 + 1.2, [-1, 0, 4.6], [-5.4, 0, 3.4]);
      return t < c2 + 1.2 ? w : typing(t, -5.4, 3.4, 1.0, 16);
    }
    if (t < c4 - 0.4) {
      // c3: walks to the risk engine, points at the gauge, flinches at the liquidation
      const w = walk(t, c3 - 0.4, c3 + 1.2, [-5.4, 0, 3.4], [0.6, 0, 3.8]);
      if (t < c3 + 1.2) return w;
      const shock = seg(t, liq, liq + 0.2) * (1 - seg(t, liq + 1.3, liq + 1.7));
      return {
        x: 0.6,
        z: 3.8,
        ry: lerp(0.2, 0.0, shock),
        armR: [-1.5 + shock * -0.8, lerp(-0.1, -0.2, shock)],
        armL: [shock * -1.2, lerp(0.1, 1.9, shock)],
        headX: -shock * 0.2,
        bob: shock * 0.08,
      };
    }
    // c4: strolls over to the order book and watches it fill
    return { ...walk(t, c4 - 0.4, c4 + 1.8, [0.6, 0, 3.8], [4.6, 0, 3.6]), ...(t > c4 + 1.8 ? { ry: 0.9, armL: [0, -0.15], armR: [-1.2, -0.4], headZ: 0.06 } : {}) };
  };

  const gauge = (t: number) => {
    const u = seg(t, c3 + 0.6, liq);
    return t < liq ? u : Math.max(0.05, 1 - seg(t, liq, liq + 0.5));
  };

  return (
    <group>
      <Island r={13} />
      <Dust r={12} c="#fcd34d" />

      {/* c1: a regulated exchange, four asset classes, perpetual futures */}
      {ASSETS.map((a, i) => (
        <Board key={a.name} clock={clock} x={-5.4 + i * 3.6} c={a.c} name={a.name} t0={c1 + 1.4 + i * 1.2} i={i} />
      ))}
      <Pop clock={clock} t0={c1 + 6.2}>
        <Anim clock={clock} update={(g, t) => ((g.rotation.y = t * 0.7), (g.position.y = 0))}>
          <Solid kind="torus" tube={0.06} p={[0, 7.2, -6.6]} s={[2.6, 2.6, 2.6]} rot={[Math.PI / 2, 0, 0]} c={PAL.amber} glow={1.8} shadow={false} />
        </Anim>
        <Label text="perpetual futures" p={[0, 9.1, -6.6]} w={3.4} h={0.62} accent={PAL.amber} font={46} />
      </Pop>

      {/* c1: the exchange itself, as a hologram on the plaza */}
      <Pop clock={clock} t0={c1 + 0.4} t1={c2 - 0.4}>
        <Solid kind="cyl" p={[0, 0.2, 1]} s={[3.2, 0.4, 3.2]} c={PAL.slate3} sides={6} />
        <Solid kind="torus" tube={0.03} p={[0, 0.5, 1]} s={[3.6, 3.6, 3.6]} rot={[Math.PI / 2, 0, 0]} c={PAL.cyan} glow={1.8} shadow={false} />
        <Anim clock={clock} update={(g, t) => ((g.rotation.y = t * 0.9), (g.position.y = 2.2 + Math.sin(t * 1.8) * 0.15))}>
          <Solid kind="octa" p={[0, 0, 1]} s={[2.2, 2.6, 2.2]} c={PAL.green} glow={1.1} />
          <Solid kind="octa" p={[0, 0, 1]} s={1.1} c={PAL.paper} glow={1.8} shadow={false} />
        </Anim>
        <Label text="AX" p={[0, 4.6, 1]} w={1.5} h={0.8} font={80} accent={PAL.green} />
        <Beam p={[0, 4, 1]} r={1.5} h={7} c={PAL.green} opacity={0.1} />
      </Pop>
      <Pulse clock={clock} p={[0, 0.1, 1]} from={c1 + 0.5} dur={1.4} c={PAL.green} max={6} />

      {/* traders */}
      <Pop clock={clock} t0={c1 + 5.8}>
        {traders.map((p, i) => (
          <group key={i} position={[p[0], 0, p[2]]}>
            <Solid kind="cone" p={[0, 0.55, 0]} s={[0.8, 1.1, 0.8]} c={[PAL.cyan, PAL.pink, PAL.amber][i]} sides={5} />
            <Solid kind="ico" p={[0, 1.35, 0]} s={0.55} c={PAL.skin} />
            <Solid p={[0.7, 0.8, 0.2]} s={[0.1, 0.55, 0.8]} c={PAL.slate} rot={[0, 0.2, 0]} />
            <Solid p={[0.76, 0.8, 0.2]} s={[0.02, 0.45, 0.68]} c={PAL.cyan} glow={1.2} rot={[0, 0.2, 0]} shadow={false} />
          </group>
        ))}
        <Label text="Traders · React + TS" p={[-9, 3, 0]} w={3} h={0.6} accent={PAL.cyan} font={46} />
      </Pop>

      {/* c2: the order management system */}
      <Pop clock={clock} t0={c2 - 0.2}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i}>
            <Solid p={[oms[0], 0.4 + i * 0.6, 0]} s={[2.6, 0.5, 2]} c={i % 2 ? PAL.slate3 : "#3b4a63"} />
            <Solid p={[oms[0], 0.4 + i * 0.6, 1.02]} s={[2.0, 0.07, 0.02]} c={PAL.orange} glow={1.6} shadow={false} />
            {[0, 1, 2].map((k) => (
              <Anim key={k} clock={clock} update={(g, t) => (g.visible = Math.sin(t * (6 + k * 2) + i) > -0.2)}>
                <Solid p={[oms[0] - 1.0 + k * 0.18, 0.55 + i * 0.6, 1.02]} s={[0.1, 0.1, 0.02]} c={[PAL.green, PAL.cyan, PAL.amber][k]} glow={2} shadow={false} />
              </Anim>
            ))}
          </group>
        ))}
        <Anim clock={clock} update={(g, t) => ((g.rotation.y = t * 1.6), (g.position.set(oms[0], 3.2, 0)))}>
          <Gear r={0.8} />
        </Anim>
        <Label text="Order management · Rust" p={[oms[0], 4.8, 0]} w={3.6} h={0.62} accent={PAL.orange} font={44} />
      </Pop>
      <Anim clock={clock} update={(g, t) => (g.visible = t > c2 + 0.2 && t < c3)}>
        <Beam p={[oms[0], 5.5, 0]} r={2.2} h={9} c={PAL.orange} opacity={0.1} />
      </Anim>

      {/* c3: the risk engine */}
      <Pop clock={clock} t0={c3 - 0.2}>
        <Solid kind="cyl" p={[risk[0], 1.9, 0]} s={[2.4, 3.2, 0.8]} c={PAL.slate3} sides={6} rot={[Math.PI / 2, 0, 0]} />
        <Solid kind="cyl" p={[risk[0], 1.9, 0.45]} s={[1.7, 2.3, 0.2]} c={PAL.violet} sides={6} glow={0.9} rot={[Math.PI / 2, 0, 0]} />
        <Solid p={[risk[0], 3.9, 0]} s={[2.2, 0.26, 0.26]} c={PAL.slate} />
        <Label text="Risk engine" p={[risk[0], 5.1, 0]} w={2.4} h={0.62} accent={PAL.violet} />
        <Label text="margin · liquidation" p={[risk[0], 4.5, 0]} w={2.6} h={0.4} font={40} bg="#111a2c" fg="#cbd5e1" />
      </Pop>
      <Anim
        clock={clock}
        update={(g, t) => {
          const f = gauge(t);
          g.visible = t > c3 - 0.1;
          g.scale.x = Math.max(0.02, f);
          g.position.x = risk[0] - 1.1 + f * 1.1;
          const m = g.children[0] as unknown as { material: { color: { set: (c: string) => void }; emissive: { set: (c: string) => void } } };
          const col = f > 0.85 ? PAL.red : f > 0.55 ? PAL.amber : PAL.green;
          m.material.color.set(col);
          m.material.emissive.set(col);
        }}
      >
        <Solid p={[0.55, 3.9, 0.17]} s={[1.1, 0.18, 0.18]} c={PAL.green} glow={1.5} shadow={false} />
      </Anim>
      {/* a leveraged position grows until it has to go */}
      <Anim
        clock={clock}
        update={(g, t) => {
          g.visible = t > c3 + 0.4 && t < liq;
          const k = seg(t, c3 + 0.4, liq);
          g.scale.setScalar(0.5 + k * 1.5);
          g.position.set(risk[0] + 2.4, 0.4 + (0.5 + k * 1.5) / 2, 1.8);
        }}
      >
        <Solid c={PAL.red} glow={0.8} />
      </Anim>
      <Pulse clock={clock} p={[risk[0] + 2.4, 0.2, 1.8]} from={liq} dur={1.1} c={PAL.red} max={5} />
      <Burst clock={clock} p={[risk[0] + 2.4, 1.2, 1.8]} from={liq} c={PAL.red} count={18} power={3.4} />
      <Pulse clock={clock} p={[risk[0], 0.2, 0]} from={liq + 0.4} dur={1.3} c={PAL.violet} max={4} />
      <Pop clock={clock} t0={liq + 0.6} t1={E("c3") + 0.4}>
        <Label text="margin restored" p={[risk[0] + 2.4, 2.4, 1.8]} w={2.5} h={0.52} bg="#064e3b" fg="#6ee7b7" />
      </Pop>

      {/* c4: market makers keep the book deep */}
      <Pop clock={clock} t0={c4 - 0.2}>
        <Solid p={[book[0], 0.18, 0]} s={[1.8, 0.36, 9.6]} c={PAL.slate3} />
        <Solid p={[book[0] - 0.95, 0.18, 0]} s={[0.1, 0.5, 9.6]} c={PAL.cyan} glow={0.8} shadow={false} />
        <Label text="AX order book" p={[book[0], 5.4, 0]} w={3.2} h={0.62} accent={PAL.green} font={46} />
      </Pop>
      {Array.from({ length: 9 }, (_, i) => (
        <Anim
          key={i}
          clock={clock}
          update={(g, t) => {
            const grow = ease(seg(t, c4 + 0.2 + i * 0.18, c4 + 2.6 + i * 0.18));
            const wob = 0.12 * Math.sin(t * 2 + i);
            g.visible = t > c4 - 0.1;
            g.scale.y = Math.max(0.01, (0.3 + (i < 4 ? 1.6 - i * 0.3 : 0.4 + (i - 5) * 0.3 + 0.8) * grow) * (1 + wob));
          }}
        >
          <Solid p={[book[0], 0.36, i < 4 ? -0.8 - (3 - i) * 0.98 : 0.8 + (i - 4) * 0.98]} s={[0.8, 1, 0.8]} c={i < 4 ? PAL.green : PAL.red} glow={0.9} />
        </Anim>
      ))}
      <Pop clock={clock} t0={c4 + 0.4}>
        {[-1, 1].map((s) => (
          <group key={s} position={[book[0] + 0.2, 0, s * 6.4]}>
            <Solid p={[0, 0.9, 0]} s={[1.2, 1.3, 1]} c={PAL.slate3} />
            <Solid p={[0, 1.95, 0]} s={[0.9, 0.7, 0.8]} c={PAL.paper} />
            <Solid p={[0.46, 2.0, 0.1]} s={[0.05, 0.14, 0.14]} c={PAL.cyan} glow={2} shadow={false} />
            <Solid p={[0.46, 2.0, -0.2]} s={[0.05, 0.14, 0.14]} c={PAL.cyan} glow={2} shadow={false} />
            <Solid kind="cyl" p={[0, 2.6, 0]} s={[0.06, 0.6, 0.06]} c={PAL.slate} sides={4} />
            <Solid kind="ico" p={[0, 3.0, 0]} s={0.28} c={PAL.amber} glow={1.6} shadow={false} />
            {[0, 1, 2].map((k) => (
              <Solid key={k} kind="cyl" p={[1, 0.15 + k * 0.22, 0]} s={[0.7, 0.2, 0.7]} c={PAL.amber} glow={0.8} sides={8} />
            ))}
          </group>
        ))}
        <Label text="Market makers" p={[book[0], 3.9, -6.4]} w={2.6} h={0.55} accent={PAL.amber} />
      </Pop>
      <Pop clock={clock} t0={c4 + 2.8}>
        <Label text="tight spread" p={[book[0], 3.2, 0]} w={2.2} h={0.5} bg="#064e3b" fg="#6ee7b7" />
      </Pop>

      {/* orders and liquidity in motion */}
      {traders.map((p, i) => (
        <Flow key={i} clock={clock} route={[[p[0] + 1, 1, p[2]], [-6.4, 1.4, p[2] * 0.3], [oms[0] - 1.5, 1.2, 0]]} from={c2 + 0.2} to={E("c4")} c={[PAL.cyan, PAL.pink, PAL.amber][i]} count={2} period={c2 < 56 ? 1.4 : 2} size={0.24} />
      ))}
      <Flow clock={clock} route={[[oms[0] + 1.5, 1.2, 0], [risk[0] - 1.4, 1.8, 0]]} from={c2 + 0.8} to={E("c4")} c={PAL.orange} count={4} period={1.2} size={0.26} />
      <Flow clock={clock} route={[[risk[0] + 1.4, 1.8, 0], [book[0] - 1, 1.6, 0]]} from={c3 + 0.4} to={E("c4")} c={PAL.green} count={3} period={1.4} size={0.26} />
      {[-1, 1].map((s) => (
        <Flow key={s} clock={clock} route={[[book[0] + 0.2, 1.8, s * 6.0], [book[0], 1.4, s * 2.4]]} from={c4 + 0.8} to={E("c4") + 1} c={PAL.amber} count={4} period={1.2} size={0.22} kind="sphere" />
      ))}
      <Link clock={clock} a={[risk[0], 3.9, 0]} b={[risk[0] + 2.4, 1.6, 1.8]} t0={c3 + 0.6} t1={liq} c={PAL.amber} w={0.05} flicker />

      <FilmChibi clock={clock} pose={pose} />
    </group>
  );
}

/* ============================================================ scene D */

export function SceneD({ clock }: { clock: Clock }) {
  const d1 = B("d1");
  const d2 = B("d2");
  const pillars = [
    { x: -4.2, h: 1.8, big: "0 → 1", small: "Liquid Inference", c: PAL.cyan, at: d1 + 0.2 },
    { x: 0, h: 2.6, big: "BYOK", small: "plus auto routing", c: PAL.amber, at: d1 + 2.6 },
    { x: 4.2, h: 1.8, big: "AX", small: "risk, OMS, MM program", c: PAL.green, at: d1 + 5.2 },
  ];
  const pose = (t: number): Pose => {
    const down = seg(t, d2 - 0.2, d2 + 0.9);
    if (down > 0) {
      const w = walk(t, d2 + 0.6, d2 + 1.8, [0, 0, 0], [5.4, 0, 4.2]);
      return { ...w, y: lerp(2.6, 0, easeOut(down)), ...(t > d2 + 1.8 ? typing(t, 5.4, 4.2, 3.6, 14) : {}) };
    }
    const k = seg(t, d1 + 0.5, d1 + 1.4);
    const hop = Math.max(0, Math.sin((t - d1) * 5)) * 0.35 * k;
    return {
      x: 0,
      y: 2.6 + hop,
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
      <Island r={12} />
      <Dust r={10} c="#fde68a" count={90} />
      {pillars.map((p, i) => (
        <Pop key={i} clock={clock} t0={p.at}>
          <Solid kind="cyl" p={[p.x, p.h / 2 + 0.1, -0.4]} s={[3, p.h, 3]} c={PAL.slate3} sides={6} />
          <Solid kind="cyl" p={[p.x, p.h + 0.15, -0.4]} s={[3.1, 0.24, 3.1]} c={p.c} sides={6} glow={1.3} />
          <Beam p={[p.x, p.h + 4.8, -0.4]} r={1.4} h={9} c={p.c} opacity={0.11} />
          <Label text={p.big} p={[p.x, p.h + 2.4 + (i === 1 ? 1.2 : 0), -0.4]} w={2.5} h={0.9} font={72} accent={p.c} />
          <Label text={p.small} p={[p.x, p.h + 1.6 + (i === 1 ? 1.2 : 0), -0.4]} w={2.7} h={0.44} font={42} bg="#111a2c" fg="#cbd5e1" />
        </Pop>
      ))}
      <Pulse clock={clock} p={[0, 0.2, -0.4]} from={d1 + 0.3} dur={1.4} c={PAL.cyan} max={6} />
      <Pulse clock={clock} p={[0, 0.2, -0.4]} from={d1 + 2.7} dur={1.4} c={PAL.amber} max={6} />
      <Pulse clock={clock} p={[0, 0.2, -0.4]} from={d1 + 5.3} dur={1.4} c={PAL.green} max={6} />

      <Pop clock={clock} t0={d1 + 1.0} t1={d2 - 0.2}>
        <Label text="Architect · 2026 –" p={[0, 8.6, -2]} w={4.4} h={0.8} font={60} accent={PAL.amber} />
      </Pop>

      {/* and then: back to work */}
      <Pop clock={clock} t0={d2 + 0.2}>
        <group position={[5.4, 0, 5.2]}>
          <Solid p={[0, 0.1, 0]} s={[2.4, 0.2, 1.6]} c={PAL.slate3} />
          <Solid p={[0, 1.05, -0.7]} s={[2.4, 1.6, 0.12]} c={PAL.slate} rot={[-0.18, 0, 0]} />
          <Solid p={[0, 1.05, -0.62]} s={[2.1, 1.3, 0.04]} c={PAL.green} glow={1.1} rot={[-0.18, 0, 0]} shadow={false} />
        </group>
        <Label text="still building" p={[5.4, 3.6, 5.2]} w={2.4} h={0.6} accent={PAL.green} font={48} />
      </Pop>

      <FilmChibi clock={clock} pose={pose} scale={1.35} />
      <Confetti clock={clock} center={[0, 0, 0]} on={d1 + 5.6} count={60} />
      <Burst clock={clock} p={[-4.2, 2.8, -0.4]} from={d1 + 0.5} c={PAL.cyan} count={16} power={2.6} />
      <Burst clock={clock} p={[0, 3.6, -0.4]} from={d1 + 2.9} c={PAL.amber} count={16} power={2.6} />
      <Burst clock={clock} p={[4.2, 2.8, -0.4]} from={d1 + 5.5} c={PAL.green} count={16} power={2.6} />
    </group>
  );
}
