"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, DoubleSide, Object3D, PlaneGeometry, type InstancedMesh } from "three";
import { HALF, INNER, WALL_HEIGHT as H, WALL_THICKNESS as T, WINDOW } from "../layout";
import { room, type Mood } from "../store";
import { C, makeSkyTexture } from "./materials";
import { Box, Instanced, RBox } from "./primitives";

const SLAB_TOP = -0.04;
const SLAB_H = 0.35;
const OUTER = -HALF - T / 2; // outer face of the walls

/* ------------------------------------------------------------- floor */

/** Individual planks (instanced) with gaps and tint variation. */
function Planks() {
  const ref = useRef<InstancedMesh>(null);
  const planks = useMemo(() => {
    const out: { x: number; z: number; len: number; w: number; tint: number }[] = [];
    const span = HALF - INNER;
    const rows = 22;
    const w = span / rows;
    let seed = 9;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let r = 0; r < rows; r++) {
      let x = INNER - rand() * 1.2;
      while (x < HALF) {
        const len = 1.1 + rand() * 1.5;
        const x0 = Math.max(x, INNER);
        const x1 = Math.min(x + len, HALF);
        if (x1 - x0 > 0.08) {
          out.push({
            x: (x0 + x1) / 2,
            z: INNER + w * (r + 0.5),
            len: x1 - x0 - 0.014,
            w: w - 0.014,
            tint: rand(),
          });
        }
        x += len;
      }
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current!;
    const o = new Object3D();
    const base = new Color(C.woodLight);
    const col = new Color();
    planks.forEach((p, i) => {
      o.position.set(p.x, -0.02, p.z);
      o.scale.set(p.len, 0.04, p.w);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      col.copy(base).offsetHSL((p.tint - 0.5) * 0.02, (p.tint - 0.5) * 0.08, (p.tint - 0.5) * 0.09);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [planks]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, planks.length]}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        room.walkTo(e.point.x, e.point.z);
      }}
    >
      <boxGeometry />
      <meshStandardMaterial roughness={0.55} />
    </instancedMesh>
  );
}

export function Floor() {
  const size = HALF - OUTER;
  const mid = (HALF + OUTER) / 2;
  return (
    <group>
      {/* diorama slab with light cut edges; dark top shows through plank gaps */}
      <mesh position={[mid, SLAB_TOP - SLAB_H / 2, mid]} receiveShadow castShadow>
        <boxGeometry args={[size, SLAB_H, size]} />
        <meshStandardMaterial attach="material-0" color={C.slab} />
        <meshStandardMaterial attach="material-1" color={C.slab} />
        <meshStandardMaterial attach="material-2" color={C.woodDark} />
        <meshStandardMaterial attach="material-3" color={C.slab} />
        <meshStandardMaterial attach="material-4" color={C.slab} />
        <meshStandardMaterial attach="material-5" color={C.slab} />
      </mesh>
      <Planks />
    </group>
  );
}

/** Invisible ground that catches the diorama's shadow. */
export function Ground({ mood }: { mood: Mood }) {
  if (mood === "night") {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SLAB_TOP - SLAB_H - 0.005, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#141a33" roughness={0.95} />
      </mesh>
    );
  }
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SLAB_TOP - SLAB_H - 0.005, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <shadowMaterial transparent opacity={mood === "day" ? 0.22 : 0.35} color={mood === "day" ? "#5a2a14" : "#0b0618"} />
    </mesh>
  );
}

/* ------------------------------------------------------------- walls */

function WallPiece({ p, s }: { p: [number, number, number]; s: [number, number, number] }) {
  return <Box p={p} s={s} c={C.wall} rough={0.95} />;
}

function Wainscot({ axis }: { axis: "x" | "z" }) {
  // axis "x": runs along x on the back wall; "z": along z on the left wall
  const len = HALF - INNER;
  const mid = (HALF + INNER) / 2;
  const h = 1.0;
  const along = (a: number, y: number, off: number): [number, number, number] =>
    axis === "x" ? [a, y, INNER + off] : [INNER + off, y, a];
  const size = (l: number, y: number, d: number): [number, number, number] =>
    axis === "x" ? [l, y, d] : [d, y, l];
  const grooves = Math.floor(len / 0.55);
  return (
    <group>
      <Box p={along(mid, h / 2 + SLAB_TOP, 0.015)} s={size(len, h, 0.03)} c={C.wainscot} rough={0.6} />
      <RBox p={along(mid, h + SLAB_TOP, 0.035)} s={size(len, 0.06, 0.07)} c={C.wainscotDark} r={0.02} />
      <Box p={along(mid, 0.06, 0.035)} s={size(len, 0.12, 0.06)} c={C.wainscotDark} />
      <Instanced
        shadow={false}
        items={Array.from({ length: grooves }, (_, i) => ({
          p: along(INNER + (i + 1) * 0.55, h / 2 + 0.06, 0.032),
          s: size(0.018, h - 0.25, 0.008),
          c: C.wainscotDark,
        }))}
      />
    </group>
  );
}

export function Walls() {
  const wallY = (SLAB_TOP + H) / 2;
  const wallH = H - SLAB_TOP;
  const { z0, z1, y0, y1 } = WINDOW;
  const leftX = -HALF;
  return (
    <group>
      {/* back wall (z = -HALF), owns the corner */}
      <WallPiece p={[(OUTER + HALF) / 2, wallY, -HALF]} s={[HALF - OUTER, wallH, T]} />
      {/* left wall with a window opening */}
      <WallPiece p={[leftX, wallY, (INNER + z0) / 2]} s={[T, wallH, z0 - INNER]} />
      <WallPiece p={[leftX, wallY, (z1 + HALF) / 2]} s={[T, wallH, HALF - z1]} />
      <WallPiece p={[leftX, (SLAB_TOP + y0) / 2, (z0 + z1) / 2]} s={[T, y0 - SLAB_TOP, z1 - z0]} />
      <WallPiece p={[leftX, (y1 + H) / 2, (z0 + z1) / 2]} s={[T, H - y1, z1 - z0]} />

      {/* light caps on the cut edges, like a diorama cross-section */}
      <Box p={[(OUTER + HALF) / 2, H + 0.015, -HALF]} s={[HALF - OUTER + 0.02, 0.03, T + 0.02]} c={C.wallCap} />
      <Box p={[leftX, H + 0.015, (INNER + HALF) / 2]} s={[T + 0.02, 0.03, HALF - INNER]} c={C.wallCap} />
      <Box p={[HALF + 0.006, wallY, -HALF]} s={[0.012, wallH, T]} c={C.wallCap} />
      <Box p={[leftX, wallY, HALF + 0.006]} s={[T, wallH, 0.012]} c={C.wallCap} />

      <Wainscot axis="x" />
      <Wainscot axis="z" />
    </group>
  );
}

/* ------------------------------------------------------------ window */

function useCurtainGeometry() {
  return useMemo(() => {
    const g = new PlaneGeometry(0.6, 2.1, 24, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * Math.PI * 6) * 0.035);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

export function Window({ mood }: { mood: Mood }) {
  const { z0, z1, y0, y1 } = WINDOW;
  const zc = (z0 + z1) / 2;
  const yc = (y0 + y1) / 2;
  const w = z1 - z0;
  const h = y1 - y0;
  const sky = useMemo(() => makeSkyTexture(mood), [mood]);
  const curtain = useCurtainGeometry();
  const frame = "#f6f1e8";

  return (
    <group>
      {/* sky outside */}
      <mesh position={[OUTER - 0.01, yc, zc]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[w + 0.02, h + 0.02]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>

      {/* frame lining the opening */}
      <RBox p={[-HALF, y0 + 0.03, zc]} s={[T + 0.06, 0.06, w]} c={frame} r={0.015} />
      <RBox p={[-HALF, y1 - 0.03, zc]} s={[T + 0.06, 0.06, w]} c={frame} r={0.015} />
      <RBox p={[-HALF, yc, z0 + 0.03]} s={[T + 0.06, h, 0.06]} c={frame} r={0.015} />
      <RBox p={[-HALF, yc, z1 - 0.03]} s={[T + 0.06, h, 0.06]} c={frame} r={0.015} />
      <Box p={[-HALF, yc, zc]} s={[0.04, h, 0.04]} c={frame} />
      <Box p={[-HALF, yc + 0.1, zc]} s={[0.04, 0.04, w]} c={frame} />
      {/* sill */}
      <RBox p={[INNER + 0.08, y0 - 0.02, zc]} s={[0.2, 0.05, w + 0.2]} c={frame} r={0.015} />
      {/* glass */}
      <mesh position={[-HALF, yc, zc]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial color="#dff3ff" transparent opacity={0.12} roughness={0.05} metalness={0} />
      </mesh>

      {/* curtain rod + curtains */}
      <mesh position={[INNER + 0.12, y1 + 0.22, zc]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, w + 1.0, 8]} />
        <meshStandardMaterial color={C.brass} metalness={0.6} roughness={0.35} />
      </mesh>
      {[z0 - 0.2, z1 + 0.2].map((z, i) => (
        <mesh
          key={i}
          geometry={curtain}
          position={[INNER + 0.13, y1 + 0.2 - 1.05, z]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={C.curtain} side={DoubleSide} transparent opacity={0.88} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
