"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { AdditiveBlending, CanvasTexture, DoubleSide, RepeatWrapping, SRGBColorSpace, type Group } from "three";
import { HALF } from "../layout";
import { ALLEY, FACADE, FLOOR_H, LEFT, OUTER, RIGHT, ROAD_IN, ROAD_OUT, ROAD_W, ROAD_Y, WALK, rng, type HouseSpec } from "../streetmap";
import type { Mood } from "../store";
import { canvasTexture } from "./materials";
import { Box, Cyl, RBox } from "./primitives";
import { Chibi, Rider, Scooter, type Outfit } from "./chibi";

/**
 * The neighbourhood: the room is a corner unit on a Saigon-style block.
 * Tube houses (nhà ống) line two streets; there's an alley (hẻm) by the
 * window, tiled sidewalks, power poles with tangled wires, parked and
 * passing motorbikes and a corner food stall.
 *
 * Only +x / +z faces are seen by the iso camera, so detail goes there.
 * Nothing out here casts shadows (cheap, and it keeps the window light).
 */

/* ------------------------------------------------------------- textures */

function makeTileTexture() {
  const t = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = "#8a4b35";
    ctx.fillRect(0, 0, 256, 256);
    const r = rng(7);
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const l = 52 + r() * 10;
        ctx.fillStyle = `hsl(${12 + r() * 8}, ${45 + r() * 10}%, ${l}%)`;
        ctx.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
        // the classic raised-dot pattern
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) ctx.fillRect(x * 64 + 9 + i * 14, y * 64 + 9 + j * 14, 4, 4);
      }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

function makeAsphaltTexture() {
  const t = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = "#3a3d46";
    ctx.fillRect(0, 0, 256, 256);
    const r = rng(11);
    for (let i = 0; i < 2600; i++) {
      const v = 40 + r() * 40;
      ctx.fillStyle = `rgba(${v},${v},${v + 6},0.5)`;
      ctx.fillRect(r() * 256, r() * 256, 1.5, 1.5);
    }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

const SIGNS = [
  { text: "PHỞ BÒ", bg: "#c81e1e", fg: "#ffe14d" },
  { text: "CÀ PHÊ", bg: "#2b1a12", fg: "#ffd28a" },
  { text: "BÁNH MÌ", bg: "#f2c230", fg: "#b3171b" },
  { text: "TẠP HÓA", bg: "#1e5bb8", fg: "#ffffff" },
  { text: "SỬA XE", bg: "#1f7a3a", fg: "#fff6c2" },
  { text: "TRÀ SỮA", bg: "#f7a8c4", fg: "#5a1238" },
  { text: "CƠM TẤM", bg: "#e8641c", fg: "#ffffff" },
  { text: "NHÀ THUỐC", bg: "#0f8a7a", fg: "#ffffff" },
  { text: "HỦ TIẾU", bg: "#b3171b", fg: "#ffffff" },
];

function makeSignTexture(i: number) {
  const s = SIGNS[i % SIGNS.length];
  return canvasTexture(512, 128, (ctx) => {
    ctx.fillStyle = s.bg;
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = s.fg;
    ctx.font = "800 64px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.text, 256, 68);
  });
}

function makeRailingTexture() {
  const t = canvasTexture(256, 64, (ctx) => {
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 256, 6);
    ctx.fillRect(0, 58, 256, 6);
    for (let x = 4; x < 256; x += 16) ctx.fillRect(x, 0, 4, 64);
  });
  t.wrapS = RepeatWrapping;
  t.repeat.set(3, 1);
  return t;
}

/** Darkens the ground away from the house so the eye stays on the room. */
function makeFadeTexture(night: boolean) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 18, 128, 128, 128);
  const tone = night ? "6,9,22" : "120,72,52";
  g.addColorStop(0, `rgba(${tone},0)`);
  g.addColorStop(0.5, `rgba(${tone},${night ? 0.45 : 0.25})`);
  g.addColorStop(1, `rgba(${tone},${night ? 0.92 : 0.6})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function makeShutterTexture() {
  return canvasTexture(64, 256, (ctx) => {
    for (let y = 0; y < 256; y += 8) {
      ctx.fillStyle = y % 16 ? "#9aa0a8" : "#b8bec6";
      ctx.fillRect(0, y, 64, 8);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, y + 7, 64, 1);
    }
  });
}

/** A grid of windows for the blocks behind; at night some are lit. */
function makeWindowGrid(seed: number, night: boolean) {
  return canvasTexture(256, 512, (ctx) => {
    const r = rng(seed * 31 + 3);
    ctx.clearRect(0, 0, 256, 512);
    for (let row = 0; row < 8; row++)
      for (let col = 0; col < 3; col++) {
        const lit = night && r() > 0.72;
        ctx.fillStyle = lit ? (r() > 0.5 ? "#9c7a52" : "#a88a62") : night ? "#141a30" : "#4f6a86";
        ctx.fillRect(22 + col * 80, 20 + row * 62, 52, 38);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(18 + col * 80, 58 + row * 62, 60, 5);
      }
  });
}

/* ---------------------------------------------------------------- house */

// dusty versions of the street's pastels, so the lit room stays the brightest thing
/** A tube house in local space: front at z = 0 facing +z, width along x, back at z = -depth. */
function House({
  spec,
  night,
  sign,
  shutter,
  railing,
}: {
  spec: HouseSpec;
  night: boolean;
  sign: CanvasTexture | null;
  shutter: CanvasTexture;
  railing: CanvasTexture;
}) {
  const { width: W, depth: D, floors, color, seed } = spec;
  const r = useMemo(() => rng(seed * 97 + 13), [seed]);
  const H = floors * FLOOR_H;
  const plan = useMemo(() => {
    return Array.from({ length: floors - 1 }, (_, i) => ({
      lit: [r() > 0.45, r() > 0.55],
      plants: r() > 0.35,
      ac: r() > 0.4,
      curtain: r() > 0.5,
    }));
  }, [floors, r]);
  const lamp = "#b8915f";
  const glass = night ? undefined : "#6f8fae";

  return (
    <group>
      {/* body */}
      <Box p={[0, WALK + H / 2, -D / 2]} s={[W, H, D]} c={color} mat="plaster" shadow={false} />
      {/* parapet + roof clutter */}
      <Box p={[0, WALK + H + 0.3, -0.06]} s={[W, 0.6, 0.12]} c={color} shadow={false} />
      <Box p={[-W / 2 + 0.06, WALK + H + 0.3, -D / 2]} s={[0.12, 0.6, D]} c={color} shadow={false} />
      <Box p={[W / 2 - 0.06, WALK + H + 0.3, -D / 2]} s={[0.12, 0.6, D]} c={color} shadow={false} />
      <group position={[W * (r() - 0.5) * 0.4, WALK + H, -D * 0.35]}>
        {/* stainless water tank on a stand */}
        <Box p={[0, 0.25, 0]} s={[0.9, 0.5, 0.6]} c="#5b5f66" shadow={false} />
        <Cyl p={[0, 0.85, 0]} args={[0.38, 0.38, 1.3, 20]} rot={[0, 0, Math.PI / 2]} c="#c9ced6" mat="metal" shadow={false} />
      </group>

      {/* ground floor: a lit shop with a signboard, or a rolled-down shutter */}
      {spec.shop !== null && sign ? (
        <>
          <mesh position={[0, WALK + 1.35, 0.01]}>
            <planeGeometry args={[W - 0.5, 2.6]} />
            <meshBasicMaterial color={night ? "#b88a5e" : "#6b5a48"} toneMapped={!night} />
          </mesh>
          {/* shelves / counter silhouettes */}
          <Box p={[0, WALK + 0.5, 0.15]} s={[W - 1.2, 1.0, 0.3]} c="#8a6a4a" shadow={false} />
          <mesh position={[0, WALK + 3.0, 0.16]}>
            <boxGeometry args={[W - 0.2, 0.85, 0.12]} />
            <meshBasicMaterial attach="material-4" map={sign} color={night ? "#a8a8a8" : "#d8d8d8"} toneMapped={!night} />
            <meshStandardMaterial attach="material-0" color="#333" />
            <meshStandardMaterial attach="material-1" color="#333" />
            <meshStandardMaterial attach="material-2" color="#333" />
            <meshStandardMaterial attach="material-3" color="#333" />
            <meshStandardMaterial attach="material-5" color="#333" />
          </mesh>
          {/* awning */}
          <mesh position={[0, WALK + 2.62, 0.5]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[W - 0.3, 0.04, 1.0]} />
            <meshStandardMaterial color={r() > 0.5 ? "#2f7d4f" : "#b3261e"} roughness={0.7} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, WALK + 1.35, 0.02]}>
          <planeGeometry args={[W - 0.5, 2.6]} />
          <meshStandardMaterial map={shutter} roughness={0.5} metalness={0.4} />
        </mesh>
      )}

      {/* upper floors: balcony, railing, two tall windows, plants, an AC unit */}
      {plan.map((f, i) => {
        const y = WALK + FLOOR_H * (i + 1);
        return (
          <group key={i}>
            <Box p={[0, y + 0.05, 0.4]} s={[W - 0.2, 0.12, 0.8]} c="#e9e4da" shadow={false} />
            <Box p={[0, y + 0.55, 0.78]} s={[W - 0.2, 0.06, 0.06]} c="#2c2f36" shadow={false} />
            <mesh position={[0, y + 0.33, 0.78]}>
              <planeGeometry args={[W - 0.2, 0.45]} />
              <meshStandardMaterial map={railing} transparent alphaTest={0.5} side={DoubleSide} color="#2c2f36" />
            </mesh>
            {[-W / 4, W / 4].map((x, k) => (
              <group key={k}>
                <Box p={[x, y + 1.2, 0.02]} s={[W / 2 - 0.5, 2.0, 0.06]} c="#efe9dd" shadow={false} />
                <mesh position={[x, y + 1.2, 0.06]}>
                  <planeGeometry args={[W / 2 - 0.7, 1.8]} />
                  {night && f.lit[k] ? (
                    <meshBasicMaterial color={f.curtain ? "#b47c4c" : lamp} toneMapped={false} />
                  ) : (
                    <meshStandardMaterial color={night ? "#1b2238" : glass} roughness={0.15} metalness={0.4} />
                  )}
                </mesh>
              </group>
            ))}
            {f.plants && (
              <group position={[W / 2 - 0.55, y + 0.11, 0.45]}>
                <Box p={[0, 0.15, 0]} s={[0.35, 0.3, 0.35]} c="#b5603e" shadow={false} />
                <mesh position={[0, 0.5, 0]}>
                  <sphereGeometry args={[0.32, 10, 8]} />
                  <meshStandardMaterial color="#3f7a45" roughness={0.9} />
                </mesh>
              </group>
            )}
            {f.ac && <Box p={[-W / 2 + 0.6, y + 2.45, 0.2]} s={[0.75, 0.5, 0.32]} c="#e8eaee" shadow={false} />}
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------ people */

const BIKE_COLORS = ["#b23a3a", "#2b2f3a", "#e9e6df", "#3a5f9e", "#8a5a3a", "#3f7f78"];
const OUTFITS: Outfit[] = [
  { top: "#4f6d8f", pants: "#2d3340", hair: "#1f1712" },
  { top: "#c9785a", pants: "#3a3530", hair: "#2a1d16" },
  { top: "#e8e1d2", pants: "#4a5568", hair: "#151010" },
  { top: "#6f8f5a", pants: "#2d3340", hair: "#3a2a1e" },
  { top: "#9a5c7a", pants: "#2b2b30", hair: "#1a1410" },
];
const HELMETS = ["#e2b33a", "#c94a4a", "#e9e6df", "#4f8a5b", "#3a5f9e"];

/** Someone strolling back and forth along a sidewalk. */
function Walker({ from, to, outfit, phase }: { from: [number, number]; to: [number, number]; outfit: Outfit; phase: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current!;
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const d = (clock.elapsedTime * 0.9 + phase * len) % (len * 2);
    const forward = d < len;
    const k = (forward ? d : len * 2 - d) / len;
    g.position.set(from[0] + (to[0] - from[0]) * k, WALK, from[1] + (to[1] - from[1]) * k);
    const ang = Math.atan2(to[0] - from[0], to[1] - from[1]);
    g.rotation.y = forward ? ang : ang + Math.PI;
  });
  return (
    <group ref={ref}>
      <Chibi outfit={outfit} pose="walk" phase={phase * 7} />
    </group>
  );
}

/** Motorbikes riding past along a lane, looping. */
function Traffic({ night, glow }: { night: boolean; glow: CanvasTexture }) {
  const bikes = useMemo(
    () => [
      { axis: "x" as const, lane: ROAD_IN + 1.5, dir: -1, speed: 4.2, offset: 0, color: BIKE_COLORS[0] },
      { axis: "x" as const, lane: ROAD_OUT - 1.5, dir: 1, speed: 3.6, offset: 18, color: BIKE_COLORS[3] },
      { axis: "z" as const, lane: ROAD_IN + 1.5, dir: 1, speed: 4.0, offset: 9, color: BIKE_COLORS[2] },
      { axis: "z" as const, lane: ROAD_OUT - 1.5, dir: -1, speed: 3.2, offset: 27, color: BIKE_COLORS[5] },
    ],
    []
  );
  const refs = useRef<(Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    bikes.forEach((b, i) => {
      const g = refs.current[i];
      if (!g) return;
      const span = 60;
      const s = (((b.offset + t * b.speed) % span) + span) % span;
      const along = b.dir > 0 ? -30 + s : 30 - s;
      if (b.axis === "x") {
        g.position.set(along, ROAD_Y, b.lane);
        g.rotation.y = b.dir > 0 ? 0 : Math.PI;
      } else {
        g.position.set(b.lane, ROAD_Y, along);
        g.rotation.y = b.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      }
    });
  });
  return (
    <>
      {bikes.map((b, i) => (
        <group key={i} ref={(g) => void (refs.current[i] = g)}>
          <Rider color={b.color} outfit={OUTFITS[i % OUTFITS.length]} helmet={HELMETS[i % HELMETS.length]} night={night} />
          {night && (
            <mesh position={[2.2, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[3, 1.6, 1]}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial map={glow} color="#fff1c8" transparent opacity={0.32} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

/* --------------------------------------------------------- street stuff */

function Pole({ x, z, lamp, toward, night, glow }: { x: number; z: number; lamp: boolean; toward: [number, number]; night: boolean; glow: CanvasTexture }) {
  const armX = toward[0] * 1.4;
  const armZ = toward[1] * 1.4;
  return (
    <group position={[x, WALK, z]}>
      <Box p={[0, 4, 0]} s={[0.22, 8, 0.22]} c="#9b9a94" shadow={false} />
      {/* crossbars where the wires hang */}
      <Box p={[0, 7.2, 0]} s={[0.9, 0.1, 0.1]} c="#6b6a64" shadow={false} />
      <Box p={[0, 6.8, 0]} s={[0.1, 0.1, 0.9]} c="#6b6a64" shadow={false} />
      {/* the famous tangle */}
      <mesh position={[0, 6.4, 0]}>
        <torusKnotGeometry args={[0.32, 0.06, 64, 6, 3, 5]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <Box p={[0, 5.6, 0.18]} s={[0.35, 0.5, 0.2]} c="#3d4148" shadow={false} />
      {lamp && (
        <>
          <mesh position={[armX / 2, 6.0, armZ / 2]} rotation={[toward[1] ? Math.PI / 2 : 0, 0, toward[0] ? Math.PI / 2 : 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          <mesh position={[armX, 5.9, armZ]}>
            <boxGeometry args={[0.45, 0.12, 0.3]} />
            {night ? <meshBasicMaterial color="#ffd08a" toneMapped={false} /> : <meshStandardMaterial color="#cfd3d8" />}
          </mesh>
          {night && (
            <mesh position={[armX, ROAD_Y - WALK + 0.02, armZ]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[7, 7]} />
              <meshBasicMaterial map={glow} color="#ffb860" transparent opacity={0.28} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

/** Sagging wires between poles: several per span, slightly different sags. */
function Wires({ poles }: { poles: [number, number][] }) {
  const lines = useMemo(() => {
    const out: [number, number, number][][] = [];
    for (let i = 0; i < poles.length - 1; i++) {
      const [ax, az] = poles[i];
      const [bx, bz] = poles[i + 1];
      for (let w = 0; w < 6; w++) {
        const y0 = WALK + 6.6 + (w % 3) * 0.28;
        const sag = 0.5 + w * 0.12;
        const pts: [number, number, number][] = [];
        for (let k = 0; k <= 12; k++) {
          const t = k / 12;
          const off = (w - 2.5) * 0.06;
          pts.push([ax + (bx - ax) * t + off * (bz !== az ? 1 : 0), y0 - sag * 4 * t * (1 - t), az + (bz - az) * t + off * (bx !== ax ? 1 : 0)]);
        }
        out.push(pts);
      }
    }
    return out;
  }, [poles]);
  return (
    <>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#0c0c0f" lineWidth={1.1} transparent opacity={0.85} />
      ))}
    </>
  );
}

function Tree({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, WALK, z]} scale={s}>
      <Cyl p={[0, 1.4, 0]} args={[0.12, 0.18, 2.8, 10]} c="#6b4a32" shadow={false} />
      {[
        [0, 3.4, 0, 1.25],
        [0.7, 3.0, 0.3, 0.9],
        [-0.6, 3.1, -0.3, 0.95],
        [0.1, 4.1, -0.2, 0.85],
      ].map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={i % 2 ? "#3f7a45" : "#4f8f4a"} roughness={0.85} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** Corner food stall: a glass cart, low table, plastic stools, an umbrella. */
function FoodStall({ night }: { night: boolean }) {
  const stools: [number, number, string][] = [
    [0.9, 0.7, "#d62828"],
    [0.9, -0.7, "#1d4ed8"],
    [1.9, 0.8, "#d62828"],
    [1.9, -0.6, "#d62828"],
  ];
  return (
    <group position={[(ALLEY + OUTER) / 2 - 0.4, WALK, HALF - 1.9]} rotation={[0, Math.PI / 2, 0]}>
      {/* cart */}
      <Box p={[0, 0.5, 0]} s={[0.7, 1.0, 1.3]} c="#c9ced6" mat="metal" shadow={false} />
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.66, 0.5, 1.26]} />
        <meshPhysicalMaterial color="#e8f4ff" transparent opacity={0.35} roughness={0.05} />
      </mesh>
      {night && (
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.9]} />
          <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
        </mesh>
      )}
      {/* pot of broth */}
      <Cyl p={[0, 1.15, 0.35]} args={[0.18, 0.16, 0.25, 16]} c="#b8bec6" mat="metal" shadow={false} />
      {/* umbrella */}
      <Cyl p={[1.4, 1.3, 0]} args={[0.025, 0.025, 2.6, 6]} c="#555" shadow={false} />
      <mesh position={[1.4, 2.55, 0]}>
        <coneGeometry args={[1.5, 0.5, 12, 1, true]} />
        <meshStandardMaterial color="#1f6f9a" side={DoubleSide} roughness={0.7} />
      </mesh>
      {/* low table + stools */}
      <Box p={[1.4, 0.42, 0]} s={[0.7, 0.05, 0.7]} c="#e8e2d4" shadow={false} />
      {[-0.3, 0.3].map((dx) =>
        [-0.3, 0.3].map((dz) => <Box key={`${dx}${dz}`} p={[1.4 + dx, 0.2, dz]} s={[0.04, 0.4, 0.04]} c="#b7b0a2" shadow={false} />)
      )}
      {stools.map(([x, z, c], i) => (
        <group key={i} position={[x, 0, z]}>
          <RBox p={[0, 0.27, 0]} s={[0.32, 0.06, 0.32]} c={c} r={0.025} shadow={false} rough={0.4} />
          <Box p={[0, 0.13, 0]} s={[0.26, 0.24, 0.26]} c={c} shadow={false} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ all */

export function Street({ mood }: { mood: Mood }) {
  const night = mood === "night";
  const tex = useMemo(
    () => ({
      tiles: makeTileTexture(),
      asphalt: makeAsphaltTexture(),
      glow: makeGlowTexture(),
      shutter: makeShutterTexture(),
      railing: makeRailingTexture(),
      fade: makeFadeTexture(night),
      signs: SIGNS.map((_, i) => makeSignTexture(i)),
      windows: [0, 1, 2].map((i) => makeWindowGrid(i, night)),
    }),
    [night]
  );

  // skyline behind the rows (backs only: plain blocks with water tanks)
  const backs = useMemo(() => {
    const r = rng(5);
    const out: { x: number; z: number; w: number; d: number; h: number; c: string }[] = [];
    for (let i = 0; i < 7; i++)
      out.push({ x: -8 - i * 5.2, z: -11 - r() * 2, w: 5, d: 8, h: (2 + Math.floor(r() * 2)) * FLOOR_H, c: FACADE[Math.floor(r() * FACADE.length)] });
    for (let i = 0; i < 4; i++)
      out.push({ x: -10.5 - r() * 2, z: -8 - i * 5.2, w: 8, d: 5, h: (2 + Math.floor(r() * 2)) * FLOOR_H, c: FACADE[Math.floor(r() * FACADE.length)] });
    return out;
  }, []);

  // poles stand beside the neighbours, never in front of the room
  const polesX: [number, number][] = [
    [ROAD_IN - 0.4, -30],
    [ROAD_IN - 0.4, -20],
    [ROAD_IN - 0.4, -10.5],
  ];
  const polesZ: [number, number][] = [
    [-10.5, ROAD_IN - 0.4],
    [-22.4, ROAD_IN - 0.4], // between the two buildings, never in front of a door
    [-36, ROAD_IN - 0.4],
  ];

  const tiles = useMemo(() => {
    const t = tex.tiles.clone();
    t.repeat.set(30, 30);
    t.needsUpdate = true;
    return t;
  }, [tex.tiles]);
  const asphalt = useMemo(() => {
    const t = tex.asphalt.clone();
    t.repeat.set(24, 24);
    t.needsUpdate = true;
    return t;
  }, [tex.asphalt]);

  return (
    <group>
      {/* road everywhere, sidewalks on top */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={asphalt} color={night ? "#8a90a8" : "#ffffff"} roughness={0.92} />
      </mesh>
      {/* our block (sidewalk) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ROAD_IN - 30, WALK, ROAD_IN - 30]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial map={tiles} roughness={0.8} color={night ? "#b9a6a6" : "#ffffff"} />
      </mesh>
      {/* the three blocks across the roads */}
      {[
        [ROAD_OUT + 30, ROAD_IN - 30],
        [ROAD_IN - 30, ROAD_OUT + 30],
        [ROAD_OUT + 30, ROAD_OUT + 30],
      ].map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, WALK, z]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial map={tiles} roughness={0.8} color={night ? "#b9a6a6" : "#ffffff"} />
        </mesh>
      ))}
      {/* curbs */}
      <Box p={[ROAD_IN, (WALK + ROAD_Y) / 2, ROAD_IN - 30]} s={[0.18, WALK - ROAD_Y, 60]} c="#c9c4ba" shadow={false} />
      <Box p={[ROAD_IN - 30, (WALK + ROAD_Y) / 2, ROAD_IN]} s={[60, WALK - ROAD_Y, 0.18]} c="#c9c4ba" shadow={false} />
      {/* lane markings + zebra crossing */}
      {Array.from({ length: 16 }, (_, i) => (
        <group key={i}>
          <Box p={[-30 + i * 4, ROAD_Y + 0.01, ROAD_IN + ROAD_W / 2]} s={[1.8, 0.01, 0.12]} c="#e9e4d4" shadow={false} />
          <Box p={[ROAD_IN + ROAD_W / 2, ROAD_Y + 0.01, -30 + i * 4]} s={[0.12, 0.01, 1.8]} c="#e9e4d4" shadow={false} />
        </group>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i} p={[ROAD_IN - 2.2, ROAD_Y + 0.012, ROAD_IN + 0.5 + i * 0.7]} s={[2.4, 0.01, 0.38]} c="#ece7d8" shadow={false} />
      ))}

      {/* tube houses */}
      {[...LEFT, ...RIGHT].map(({ h, pos, rot, ...rest }, i) =>
        "building" in rest && rest.building ? null : (
          <group key={i} position={pos} rotation={[0, rot, 0]}>
            <House spec={h} night={night} sign={h.shop !== null ? tex.signs[h.shop] : null} shutter={tex.shutter} railing={tex.railing} />
          </group>
        )
      )}
      {backs.map((b, i) => (
        <group key={i}>
          <Box p={[b.x, WALK + b.h / 2, b.z]} s={[b.w, b.h, b.d]} c={b.c} mat="plaster" shadow={false} />
          {/* window grids on the two faces the camera sees */}
          <mesh position={[b.x, WALK + b.h / 2, b.z + b.d / 2 + 0.02]}>
            <planeGeometry args={[b.w - 0.6, b.h - 0.8]} />
            <meshBasicMaterial map={tex.windows[i % tex.windows.length]} transparent toneMapped={false} color={night ? "#ffffff" : "#9aa7b8"} />
          </mesh>
          <mesh position={[b.x + b.w / 2 + 0.02, WALK + b.h / 2, b.z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[b.d - 0.6, b.h - 0.8]} />
            <meshBasicMaterial map={tex.windows[(i + 1) % tex.windows.length]} transparent toneMapped={false} color={night ? "#ffffff" : "#9aa7b8"} />
          </mesh>
          <Cyl p={[b.x + 1, WALK + b.h + 0.6, b.z]} args={[0.38, 0.38, 1.3, 16]} rot={[0, 0, Math.PI / 2]} c="#c9ced6" mat="metal" shadow={false} />
        </group>
      ))}

      {/* the alley beside the window: a back wall, bikes, a clothesline */}
      <Box p={[(ALLEY + OUTER) / 2, WALK + 2.2, -HALF - 0.1]} s={[OUTER - ALLEY, 4.4, 0.2]} c="#d8cfbf" mat="plaster" shadow={false} />
      <group position={[(ALLEY + OUTER) / 2, WALK, -2.6]} rotation={[0, -Math.PI / 2, 0]}>
        <Scooter color={BIKE_COLORS[1]} />
      </group>
      <Line
        points={[
          [ALLEY + 0.1, WALK + 3.4, -1],
          [(ALLEY + OUTER) / 2, WALK + 3.0, -1],
          [OUTER - 0.05, WALK + 3.4, -1],
        ]}
        color="#222"
        lineWidth={1}
      />
      {["#e04f5f", "#f2c230", "#3b82f6"].map((c, i) => (
        <mesh key={c} position={[ALLEY + 1.2 + i * 1.0, WALK + 2.75, -1]}>
          <planeGeometry args={[0.6, 0.75]} />
          <meshStandardMaterial color={c} side={DoubleSide} roughness={0.9} />
        </mesh>
      ))}

      {/* parked bikes along the fronts */}
      {[
        // parked hard against the house fronts so the sidewalk stays walkable
        [HALF + 0.65, -6.5, Math.PI / 2 + 0.08],
        [HALF + 0.65, -8.4, Math.PI / 2 - 0.06],
        [HALF + 0.65, -11.2, Math.PI / 2 + 0.05],
        [-11.6, HALF + 0.65, 0.06],
        [-12.9, HALF + 0.65, -0.05],
        [-20.2, HALF + 0.65, 0.07],
      ].map(([x, z, ry], i) => (
        <group key={i} position={[x, WALK, z]} rotation={[0, ry, 0]}>
          <Scooter color={BIKE_COLORS[(i * 2 + 1) % BIKE_COLORS.length]} />
        </group>
      ))}

      <FoodStall night={night} />

      {/* poles, wires, lamps, trees */}
      {[...polesX, ...polesZ].map(([x, z], i) => (
        <Pole key={i} x={x} z={z} lamp={i % 3 !== 1} toward={x > z ? [1, 0] : [0, 1]} night={night} glow={tex.glow} />
      ))}
      <Wires poles={polesX} />
      <Wires poles={polesZ} />
      <Tree x={ROAD_IN - 0.9} z={-15} s={1.1} />
      <Tree x={ROAD_IN - 0.9} z={-25} />
      <Tree x={-11.4} z={ROAD_IN - 0.9} s={0.95} />
      <Tree x={-23.6} z={ROAD_IN - 0.9} />
      <Tree x={ROAD_OUT + 1.2} z={-8} s={1.15} />
      <Tree x={ROAD_OUT + 1.2} z={3} />
      <Tree x={-6} z={ROAD_OUT + 1.2} s={1.1} />
      <Tree x={ROAD_OUT + 1.5} z={ROAD_OUT + 1.5} />

      {/* neighbours */}
      <group position={[(ALLEY + OUTER) / 2 - 1.5, WALK, HALF - 1.9]} rotation={[0, Math.PI / 2, 0]}>
        <Chibi outfit={{ top: "#e9e3d6", pants: "#5a4a3a", hair: "#1a1410", accent: "#b23a3a" }} />
      </group>
      <group position={[(ALLEY + OUTER) / 2 - 0.4, WALK + 0.06, HALF - 2.7]} rotation={[0, Math.PI, 0]}>
        <Chibi outfit={OUTFITS[3]} pose="sit" phase={1.3} />
      </group>
      <group position={[HALF + 1.5, WALK, -9.6]} rotation={[0, -0.5, 0]}>
        <Scooter color={BIKE_COLORS[4]} />
        <group position={[-0.25, 0.42, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Chibi outfit={OUTFITS[0]} pose="ride" helmet={HELMETS[1]} />
        </group>
      </group>
      <Walker from={[ROAD_IN - 1.6, -11]} to={[ROAD_IN - 1.6, -24]} outfit={OUTFITS[1]} phase={0.2} />
      <Walker from={[-12, ROAD_IN - 1.6]} to={[-26, ROAD_IN - 1.6]} outfit={OUTFITS[4]} phase={0.6} />

      <Traffic night={night} glow={tex.glow} />

      {/* focus: the ground darkens away from the house */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WALK + 0.02, 0]} renderOrder={2}>
        <planeGeometry args={[64, 64]} />
        <meshBasicMaterial map={tex.fade} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
