"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, RepeatWrapping, TubeGeometry, Vector3, type Mesh } from "three";
import { CLIMB, FURNITURE, INNER, WALL_HEIGHT } from "../layout";
import { room, type Mood } from "../store";
import { C, canvasTexture, makePixelPoster, makeTvTexture } from "./materials";
import { Ball, Box, Cyl, Glow, Instanced, RBox } from "./primitives";

/* ------------------------------------------------------ climbing wall */

const HOLD_COLORS = ["#f43f5e", "#facc15", "#22c55e", "#3b82f6", "#a855f7", "#f97316", "#14b8a6"];

type Hold = { a: number; y: number; r: number; c: string; rot: number };

function useHolds(len: number, seed0: number) {
  return useMemo(() => {
    let seed = seed0;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const out: Hold[] = [];
    for (let i = 0; i < 34; i++) {
      out.push({
        a: 0.15 + rand() * (len - 0.3),
        y: 0.35 + rand() * (WALL_HEIGHT - 0.7),
        r: 0.035 + rand() * 0.05,
        c: HOLD_COLORS[Math.floor(rand() * HOLD_COLORS.length)],
        rot: rand() * Math.PI,
      });
    }
    return out;
  }, [len, seed0]);
}

/** Plywood with a t-nut grid, painted once instead of ~150 tiny meshes. */
function usePlywood(len: number, h: number) {
  return useMemo(() => {
    const tex = canvasTexture(128, 128, (ctx) => {
      ctx.fillStyle = "#e2c99f";
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = "#b9a07a";
      for (const [x, y] of [
        [32, 32],
        [96, 32],
        [32, 96],
        [96, 96],
      ]) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(150,120,80,0.25)";
      ctx.fillRect(0, 0, 128, 1);
      ctx.fillRect(0, 0, 1, 128);
    });
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(len / 0.6, h / 0.6);
    return tex;
  }, [len, h]);
}

/** One plywood panel with holds. `axis` = which wall it lies along. */
function ClimbPanel({ axis, from, to }: { axis: "x" | "z"; from: number; to: number }) {
  const len = to - from;
  const mid = (from + to) / 2;
  const holds = useHolds(len, axis === "x" ? 13 : 29);
  const off = INNER + 0.06;
  const h = WALL_HEIGHT - 0.15;
  const ply = usePlywood(len, h);
  const at = (a: number, y: number, depth: number): [number, number, number] =>
    axis === "x" ? [from + a, y, off + depth] : [off + depth, y, from + a];
  const items = useMemo(
    () =>
      holds.map((hd) => ({
        p: at(hd.a, hd.y, 0.03),
        s: (axis === "x" ? [hd.r, hd.r * 0.8, hd.r * 0.55] : [hd.r * 0.55, hd.r * 0.8, hd.r]) as [number, number, number],
        c: hd.c,
        rot: [hd.rot, hd.rot * 0.5, 0] as [number, number, number],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [holds, axis]
  );
  return (
    <group>
      <mesh position={axis === "x" ? [mid, h / 2 + 0.05, off] : [off, h / 2 + 0.05, mid]} castShadow receiveShadow>
        <boxGeometry args={axis === "x" ? [len, h, 0.04] : [0.04, h, len]} />
        <meshStandardMaterial map={ply} roughness={0.85} />
      </mesh>
      <Instanced items={items} rough={0.85} flat>
        <icosahedronGeometry args={[1, 0]} />
      </Instanced>
    </group>
  );
}

export function ClimbingWall() {
  const rope = useMemo(() => {
    const top = new Vector3(INNER + 0.25, WALL_HEIGHT - 0.1, -3.9);
    const pts = [
      top,
      new Vector3(INNER + 0.32, 1.8, -3.85),
      new Vector3(INNER + 0.36, 0.6, -3.8),
      new Vector3(INNER + 0.45, 0.08, -3.6),
      new Vector3(INNER + 0.7, 0.07, -3.75),
      new Vector3(INNER + 0.6, 0.07, -3.95),
    ];
    return new TubeGeometry(new CatmullRomCurve3(pts), 48, 0.012, 6, false);
  }, []);
  return (
    <group>
      <ClimbPanel axis="x" from={INNER + 0.08} to={CLIMB.backX1} />
      <ClimbPanel axis="z" from={INNER + 0.08} to={CLIMB.leftZ1} />
      {/* a triangular volume for a bit of shape */}
      <mesh position={[INNER + 0.15, 2.1, -2.7]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.32, 0.6, 3]} />
        <meshStandardMaterial color="#6d8fd8" flatShading roughness={0.8} />
      </mesh>
      {/* top anchor + rope */}
      <Ball p={[INNER + 0.25, WALL_HEIGHT - 0.1, -3.9]} r={0.03} c={C.metal} metal={0.8} />
      <mesh geometry={rope} castShadow>
        <meshStandardMaterial color="#ef4444" roughness={0.7} />
      </mesh>
      {/* crash mat (thin enough to walk on) */}
      <RBox p={[-3.75, 0.03, -3.75]} s={[2.15, 0.06, 2.15]} c="#334a7d" r={0.025} />
      {/* chalk bag + shoes */}
      <Cyl p={[-2.95, 0.15, -3.1]} args={[0.07, 0.07, 0.16, 14]} c="#f59e0b" />
      <Cyl p={[-2.95, 0.235, -3.1]} args={[0.062, 0.062, 0.012, 14]} c="#ffffff" />
      {[0, 1].map((i) => (
        <RBox key={i} p={[-3.25 + i * 0.12, 0.1, -2.9]} s={[0.09, 0.07, 0.24]} c="#7c3aed" r={0.03} rot={[0, 0.3 + i * 0.2, 0]} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------- game corner */

export function GameCorner({ mood }: { mood: Mood }) {
  const { x, z, w, d, h } = FURNITURE.mediaUnit;
  const tv = useMemo(makeTvTexture, []);
  const poster = useMemo(makePixelPoster, []);
  const consoleLed = useRef<Mesh>(null);
  const last = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const playing = room.get().action === "game";
    // ~24fps is plenty for a pixel game
    if (t - last.current > 1 / 24) {
      last.current = t;
      tv.draw(t, playing);
    }
    if (consoleLed.current) consoleLed.current.visible = playing || Math.floor(t * 1.5) % 2 === 0;
  });

  return (
    <group>
      <group position={[x, 0, z]}>
        {/* low media unit */}
        <RBox p={[0, h / 2 + 0.06, 0]} s={[w, h - 0.06, d]} c="#f2ece2" r={0.03} />
        {[-1, 1].map((s) => (
          <RBox key={s} p={[s * (w / 2 - 0.1), 0.03, 0]} s={[0.06, 0.06, d - 0.1]} c={C.woodDark} r={0.015} />
        ))}
        <Box p={[-w / 4, h / 2 + 0.06, d / 2 + 0.001]} s={[0.004, h - 0.14, 0.002]} c="#d8d0c2" shadow={false} />
        <Box p={[w / 4, h / 2 + 0.06, d / 2 + 0.001]} s={[0.004, h - 0.14, 0.002]} c="#d8d0c2" shadow={false} />

        {/* TV */}
        <RBox p={[0, h + 0.03, -0.08]} s={[0.4, 0.03, 0.18]} c={C.black} r={0.01} />
        <RBox p={[0, h + 0.12, -0.12]} s={[0.05, 0.16, 0.03]} c={C.black} r={0.01} />
        <RBox p={[0, h + 0.62, -0.1]} s={[1.5, 0.86, 0.05]} c="#111114" r={0.02} />
        <mesh position={[0, h + 0.62, -0.074]}>
          <planeGeometry args={[1.44, 0.8]} />
          <meshBasicMaterial map={tv} color={[1.5, 1.5, 1.5]} toneMapped={false} />
        </mesh>

        {/* console + controller */}
        <RBox p={[0.6, h + 0.05, 0.05]} s={[0.32, 0.08, 0.24]} c="#fafafa" r={0.025} />
        <mesh ref={consoleLed} position={[0.6, h + 0.05, 0.172]}>
          <boxGeometry args={[0.12, 0.008, 0.004]} />
          <Glow c="#60a5fa" i={4} />
        </mesh>
        <group position={[-0.55, h + 0.03, 0.08]} rotation={[0, 0.4, 0]}>
          <RBox p={[0, 0, 0]} s={[0.18, 0.04, 0.1]} c="#1f2937" r={0.02} />
          <Ball p={[-0.07, 0, 0.03]} r={0.035} c="#1f2937" />
          <Ball p={[0.07, 0, 0.03]} r={0.035} c="#1f2937" />
        </group>
      </group>

      {/* pixel-art poster above the TV */}
      <group position={[x + 1.25, 1.95, INNER + 0.03]}>
        <RBox p={[0, 0, 0]} s={[0.5, 0.66, 0.03]} c="#111114" r={0.01} />
        <mesh position={[0, 0, 0.017]}>
          <planeGeometry args={[0.44, 0.6]} />
          <meshStandardMaterial map={poster} roughness={0.6} />
        </mesh>
      </group>

      {/* beanbag */}
      <mesh position={[x, 0.22, z + 1.8]} scale={[1, 0.55, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.42, 28, 20]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.9} />
      </mesh>
      {/* TV glow spill at night */}
      {mood === "night" && <pointLight position={[x, 1.1, z + 0.5]} color="#818cf8" intensity={2.2} distance={3.2} decay={1.6} />}
    </group>
  );
}
