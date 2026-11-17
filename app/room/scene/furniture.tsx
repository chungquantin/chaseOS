"use client";

import { useMemo } from "react";
import { DoubleSide, Shape, ShapeGeometry } from "three";
import { FURNITURE, INNER } from "../layout";
import type { Mood } from "../store";
import { jobDocuments } from "app/data/career";
import { C, makeCodeTexture, makeJobPaperTexture } from "./materials";
import { MarketScreen } from "./market-screen";
import { Ball, Box, Cyl, Glow, Instanced, RBox } from "./primitives";

/* ----------------------------------------------- Architect: trading desk */

function NeonCandles() {
  // a neon candlestick sign on the wall above the monitors
  const candles: [number, number, number, boolean][] = [
    // x, bodyY, bodyH, green
    [-0.36, 0.05, 0.22, false],
    [-0.12, -0.02, 0.18, false],
    [0.12, 0.08, 0.26, true],
    [0.36, 0.2, 0.3, true],
  ];
  return (
    <group position={[-0.25, 2.12, INNER + 0.03]}>
      <RBox p={[0, 0.08, -0.01]} s={[1.05, 0.7, 0.015]} c="#141218" r={0.01} />
      {candles.map(([x, y, h, up], i) => (
        <group key={i} position={[x, y, 0.01]}>
          <mesh>
            <boxGeometry args={[0.012, h + 0.18, 0.012]} />
            <Glow c={up ? C.green : C.red} i={4} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.08, h, 0.02]} />
            <Glow c={up ? C.green : C.red} i={3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Desk() {
  const { x, z, w, d, h } = FURNITURE.desk;
  const code = useMemo(makeCodeTexture, []);
  return (
    <group>
      <NeonCandles />
      <group position={[x, 0, z]}>
        <RBox p={[0, h - 0.035, 0]} s={[w, 0.07, d]} c={C.woodMid} r={0.02} rough={0.5} />
        {/* sled legs */}
        {[-1, 1].map((sx) => (
          <RBox key={sx} p={[sx * (w / 2 - 0.12), (h - 0.07) / 2, 0]} s={[0.06, h - 0.07, d - 0.12]} c={C.black} r={0.02} />
        ))}
        <RBox p={[w / 2 - 0.45, 0.36, -0.02]} s={[0.5, 0.6, d - 0.16]} c={C.charcoal} r={0.02} />
        {[0.18, 0.36, 0.54].map((y) => (
          <Box key={y} p={[w / 2 - 0.45, y, d / 2 - 0.09]} s={[0.2, 0.015, 0.01]} c={C.metal} />
        ))}
        {/* desk mat, keyboard (RGB), mouse */}
        <Box p={[-0.2, h + 0.003, 0.18]} s={[1.3, 0.006, 0.44]} c="#26242b" shadow={false} />
        <RBox p={[-0.3, h + 0.02, 0.2]} s={[0.62, 0.03, 0.2]} c="#1d1c21" r={0.01} />
        <mesh position={[-0.3, h + 0.037, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.58, 0.16]} />
          <Glow c={C.violet} i={1.8} />
        </mesh>
        <RBox p={[0.2, h + 0.02, 0.22]} s={[0.07, 0.03, 0.11]} c="#1d1c21" r={0.015} />

        {/* ultrawide on an arm — live market */}
        <group position={[-0.25, h, -0.3]}>
          <RBox p={[0, 0.015, 0]} s={[0.34, 0.03, 0.22]} c={C.black} r={0.01} />
          <RBox p={[0, 0.25, -0.04]} s={[0.05, 0.45, 0.05]} c={C.black} r={0.015} />
          <RBox p={[0, 0.66, 0]} s={[1.6, 0.62, 0.045]} c="#141417" r={0.02} />
          <group position={[0, 0.66, 0.024]}>
            <MarketScreen width={1.52} height={0.55} />
          </group>
        </group>

        {/* vertical code monitor */}
        <group position={[0.85, h, -0.25]} rotation={[0, -0.35, 0]}>
          <RBox p={[0, 0.015, 0]} s={[0.22, 0.03, 0.18]} c={C.black} r={0.01} />
          <RBox p={[0, 0.18, -0.03]} s={[0.04, 0.3, 0.04]} c={C.black} r={0.012} />
          <RBox p={[0, 0.62, 0]} s={[0.42, 0.68, 0.04]} c="#141417" r={0.02} />
          <mesh position={[0, 0.62, 0.021]}>
            <planeGeometry args={[0.37, 0.62]} />
            <meshBasicMaterial map={code} color={[1.4, 1.4, 1.4]} toneMapped={false} />
          </mesh>
        </group>

        {/* PC tower with RGB fans */}
        <group position={[-1.15, h, -0.12]}>
          <RBox p={[0, 0.3, 0]} s={[0.3, 0.6, 0.52]} c="#18171c" r={0.025} rough={0.4} />
          {[0.14, 0.3, 0.46].map((y, i) => (
            <mesh key={y} position={[0, y, 0.262]}>
              <torusGeometry args={[0.07, 0.012, 8, 28]} />
              <Glow c={[C.cyan, C.violet, C.pink][i]} i={4} />
            </mesh>
          ))}
        </group>

        {/* mug + headphones */}
        <Cyl p={[0.55, h + 0.07, 0.25]} args={[0.055, 0.05, 0.14]} c={C.accent} />
        <mesh position={[0.95, h + 0.12, 0.2]} rotation={[0, 0.5, 0]} castShadow>
          <torusGeometry args={[0.1, 0.018, 8, 20, Math.PI]} />
          <meshStandardMaterial color={C.black} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export function Chair() {
  const { x, z } = FURNITURE.chair;
  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI + 0.35, 0]}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i}>
            <RBox p={[Math.cos(a) * 0.15, 0.07, Math.sin(a) * 0.15]} s={[0.3, 0.035, 0.05]} rot={[0, -a, 0]} c={C.black} r={0.012} />
            <Ball p={[Math.cos(a) * 0.29, 0.035, Math.sin(a) * 0.29]} r={0.035} c={C.black} />
          </group>
        );
      })}
      <Cyl p={[0, 0.27, 0]} args={[0.03, 0.03, 0.4]} c={C.metal} metal={0.8} rough={0.3} />
      <RBox p={[0, 0.5, 0]} s={[0.54, 0.1, 0.52]} c="#2d2c33" r={0.04} />
      <RBox p={[0, 0.92, -0.24]} s={[0.5, 0.75, 0.1]} c="#2d2c33" r={0.05} rot={[-0.1, 0, 0]} />
      <RBox p={[0, 0.98, -0.18]} s={[0.3, 0.14, 0.05]} c={C.accent} r={0.025} />
      {[-1, 1].map((s) => (
        <RBox key={s} p={[s * 0.29, 0.66, 0]} s={[0.05, 0.05, 0.34]} c={C.black} r={0.02} />
      ))}
    </group>
  );
}

/* ----------------------------------------------------------- plants */

function useLeafGeometry() {
  return useMemo(() => {
    const s = new Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.13, 0.18, 0, 0.5);
    s.quadraticCurveTo(-0.13, 0.18, 0, 0);
    return new ShapeGeometry(s, 8);
  }, []);
}

export function Plant() {
  const { x, z } = FURNITURE.plant;
  const leaf = useLeafGeometry();
  const leaves = useMemo(() => {
    const out: { y: number; a: number; tilt: number; s: number; c: string }[] = [];
    for (let i = 0; i < 16; i++) {
      out.push({
        y: 0.55 + (i % 4) * 0.12,
        a: i * 2.4,
        tilt: 0.5 + (i % 3) * 0.25,
        s: 0.9 + (i % 5) * 0.12,
        c: i % 2 ? C.leaf : C.leafLight,
      });
    }
    return out;
  }, []);
  return (
    <group position={[x, 0, z]}>
      <Cyl p={[0, 0.25, 0]} args={[0.26, 0.2, 0.5]} c={C.pot} rough={0.6} />
      <Cyl p={[0, 0.49, 0]} args={[0.24, 0.24, 0.02]} c="#4a3426" />
      {leaves.map((l, i) => (
        <group key={i} position={[0, l.y, 0]} rotation={[0, l.a, 0]}>
          <mesh geometry={leaf} rotation={[-l.tilt, 0, 0]} scale={l.s} castShadow>
            <meshStandardMaterial color={l.c} side={DoubleSide} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Succulent({ p }: { p: [number, number, number] }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.05, 0]} args={[0.06, 0.05, 0.1]} c={C.paper} />
      <mesh position={[0, 0.13, 0]} castShadow>
        <icosahedronGeometry args={[0.065, 0]} />
        <meshStandardMaterial color={C.leafLight} flatShading />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------- bookshelf */

const BOOK_COLORS = ["#b45348", "#3f6c8f", "#d6a64b", "#4e7a4b", "#7c5a8a", "#e7dcc6", "#2f3e46", "#e07a5f"];

export function Bookshelf() {
  const { x, z, w, d, h } = FURNITURE.bookshelf;
  const shelves = 5;
  const gap = (h - 0.06) / shelves;
  const books = useMemo(() => {
    const out: { y: number; z: number; t: number; hgt: number; c: string }[] = [];
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let s = 0; s < shelves; s++) {
      let bz = -d / 2 + 0.08;
      // leave room for a trophy/decor on some shelves
      const end = s % 2 ? d / 2 - 0.5 : d / 2 - 0.1;
      while (bz < end) {
        const t = 0.045 + rand() * 0.045;
        const hgt = gap * (0.6 + rand() * 0.28);
        out.push({ y: 0.05 + s * gap + hgt / 2, z: bz + t / 2, t, hgt, c: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)] });
        bz += t + 0.006;
      }
    }
    return out;
  }, [d, gap]);

  return (
    <group position={[x, 0, z]}>
      <RBox p={[-w / 2 + 0.02, h / 2, 0]} s={[0.03, h, d]} c="#232227" r={0.01} />
      <RBox p={[0, h / 2, -d / 2 + 0.025]} s={[w, h, 0.05]} c="#2b2a30" r={0.015} />
      <RBox p={[0, h / 2, d / 2 - 0.025]} s={[w, h, 0.05]} c="#2b2a30" r={0.015} />
      {Array.from({ length: shelves + 1 }, (_, i) => (
        <RBox key={i} p={[0, 0.025 + i * gap, 0]} s={[w, 0.04, d]} c="#2b2a30" r={0.012} />
      ))}
      <Instanced items={books.map((b) => ({ p: [0.03, b.y, b.z], s: [w - 0.14, b.hgt, b.t], c: b.c }))} rough={0.7} />
      {/* small trophy and vase — hints of achievements to come */}
      <group position={[0.05, 0.05 + gap, d / 2 - 0.28]}>
        <Cyl p={[0, 0.03, 0]} args={[0.06, 0.07, 0.06]} c="#1d1d1f" />
        <Cyl p={[0, 0.1, 0]} args={[0.012, 0.012, 0.08]} c={C.brass} metal={0.9} rough={0.25} />
        <Cyl p={[0, 0.2, 0]} args={[0.07, 0.03, 0.12]} c={C.brass} metal={0.9} rough={0.25} />
      </group>
      <group position={[0.05, 0.05 + gap * 3, d / 2 - 0.28]}>
        <Cyl p={[0, 0.1, 0]} args={[0.05, 0.07, 0.2]} c="#d9d4ca" rough={0.3} />
      </group>
      <Succulent p={[0.05, h, 0.3]} />
    </group>
  );
}

/* ------------------------------------------- coffee table: past jobs */

/** Scatter positions (x, z, rotation) for the papers on the table top. */
const PAPER_SPOTS: [number, number, number][] = [
  [-0.58, -0.26, 0.12],
  [-0.2, -0.3, -0.08],
  [0.2, -0.24, 0.1],
  [0.6, -0.28, -0.14],
  [-0.62, 0.22, -0.1],
  [-0.22, 0.24, 0.16],
  [0.18, 0.2, -0.06],
  [0.58, 0.24, 0.12],
  [0.02, -0.02, -0.22],
];

export function CoffeeTable() {
  const { x, z, w, d, h } = FURNITURE.coffeeTable;
  const papers = useMemo(() => {
    return jobDocuments().map((doc) => makeJobPaperTexture(doc.title, doc.subtitle, doc.period, doc.accent));
  }, []);
  return (
    <group position={[x, 0, z]}>
      {/* round fluffy rug */}
      <Cyl p={[0, 0.012, 0]} args={[1.75, 1.75, 0.024, 48]} c={C.rug} rough={1} shadow={false} />
      <Cyl p={[0, 0.026, 0]} args={[1.5, 1.5, 0.006, 48]} c="#86c7b9" rough={1} shadow={false} />

      <RBox p={[0, h - 0.03, 0]} s={[w, 0.06, d]} c={C.woodMid} r={0.02} rough={0.45} />
      {[-1, 1].map((sx) => (
        <RBox key={sx} p={[sx * (w / 2 - 0.16), (h - 0.06) / 2, 0]} s={[0.05, h - 0.06, d - 0.12]} c={C.black} r={0.015} />
      ))}
      {/* the job documents, spread out */}
      {papers.map((tex, i) => {
        const [px, pz, rot] = PAPER_SPOTS[i % PAPER_SPOTS.length];
        return (
          <mesh key={i} position={[px, h + 0.004 + i * 0.0015, pz]} rotation={[-Math.PI / 2, 0, rot]} receiveShadow>
            <planeGeometry args={[0.32, 0.42]} />
            <meshStandardMaterial map={tex} roughness={1} />
          </mesh>
        );
      })}
      <Cyl p={[0.82, h + 0.05, 0.44]} args={[0.05, 0.045, 0.09]} c={C.paper} />
      <Cyl p={[0.82, h + 0.093, 0.44]} args={[0.044, 0.044, 0.004]} c="#5b3a26" />
    </group>
  );
}

export function Sideboard() {
  const { x, z, w, d, h } = FURNITURE.sideboard;
  return (
    <group position={[x, 0, z]}>
      <RBox p={[0, h / 2 + 0.05, 0]} s={[w, h - 0.1, d]} c={C.woodLight} r={0.03} />
      <RBox p={[0, h - 0.02, 0]} s={[w + 0.04, 0.04, d + 0.04]} c={C.woodMid} r={0.015} />
      {[-1, 1].map((s) => (
        <Cyl key={s} p={[w / 2 + 0.02, h / 2 + 0.05, s * 0.06]} args={[0.015, 0.015, 0.03]} rot={[0, 0, Math.PI / 2]} c={C.brass} metal={0.8} />
      ))}
      <RBox p={[0, h + 0.03, -0.35]} s={[0.24, 0.05, 0.32]} c="#3f6c8f" r={0.01} />
      <RBox p={[0, h + 0.08, -0.35]} s={[0.22, 0.05, 0.3]} c="#d6a64b" r={0.01} rot={[0, 0.15, 0]} />
      <Succulent p={[0, h, 0.35]} />
    </group>
  );
}

/* --------------------------------------------- sofa + the Rust crab */

function RustCrab({ p }: { p: [number, number, number] }) {
  const orange = "#f45d22";
  return (
    <group position={p} rotation={[0, -Math.PI / 2 + 0.3, 0]} scale={0.9}>
      <mesh position={[0, 0.09, 0]} scale={[1.3, 0.75, 1]} castShadow>
        <sphereGeometry args={[0.11, 20, 16]} />
        <meshStandardMaterial color={orange} roughness={0.85} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Cyl p={[s * 0.04, 0.2, 0.05]} args={[0.008, 0.008, 0.07]} c={orange} />
          <Ball p={[s * 0.04, 0.24, 0.05]} r={0.022} c="#fff" />
          <Ball p={[s * 0.04, 0.24, 0.07]} r={0.011} c="#111" />
          <Ball p={[s * 0.17, 0.1, 0.07]} r={0.05} c={orange} />
          {[0, 1, 2].map((k) => (
            <RBox key={k} p={[s * 0.15, 0.03, -0.05 + k * 0.05]} s={[0.08, 0.02, 0.02]} c={orange} r={0.008} rot={[0, 0, s * -0.4]} />
          ))}
        </group>
      ))}
    </group>
  );
}

export function Sofa() {
  const { x, z, w, d } = FURNITURE.sofa;
  return (
    <group position={[x, 0, z]}>
      <RBox p={[0, 0.06, 0]} s={[w - 0.05, 0.08, d - 0.1]} c={C.woodDark} r={0.02} />
      <RBox p={[0, 0.25, 0]} s={[w, 0.3, d]} c={C.sofa} r={0.08} />
      <RBox p={[w / 2 - 0.13, 0.58, 0]} s={[0.26, 0.5, d - 0.04]} c={C.sofa} r={0.1} />
      {[-1, 1].map((s) => (
        <RBox key={s} p={[0, 0.5, s * (d / 2 - 0.12)]} s={[w, 0.28, 0.24]} c={C.sofa} r={0.1} />
      ))}
      {[-0.5, 0.5].map((cz) => (
        <group key={cz}>
          <RBox p={[-0.08, 0.45, cz]} s={[w - 0.3, 0.12, 0.88]} c={C.cushion} r={0.05} />
          <RBox p={[w / 2 - 0.3, 0.7, cz]} s={[0.18, 0.4, 0.84]} c={C.cushion} r={0.08} rot={[0, 0, 0.12]} />
        </group>
      ))}
      <RBox p={[w / 2 - 0.42, 0.66, -0.75]} s={[0.12, 0.3, 0.3]} c={C.accent} r={0.06} rot={[0, 0.2, 0.25]} />
      <RustCrab p={[-0.12, 0.51, 0.45]} />
    </group>
  );
}

/* -------------------------------------------------------------- lamp */

export function FloorLamp({ mood }: { mood: Mood }) {
  const { x, z, h } = FURNITURE.lamp;
  const on = mood === "night";
  return (
    <group position={[x, 0, z]}>
      <Cyl p={[0, 0.02, 0]} args={[0.18, 0.2, 0.04]} c={C.black} />
      <Cyl p={[0, h / 2, 0]} args={[0.015, 0.015, h]} c={C.black} />
      <mesh position={[0, h, 0]}>
        <cylinderGeometry args={[0.14, 0.24, 0.32, 24, 1, true]} />
        <meshStandardMaterial
          color={C.lampShade}
          emissive="#ffcf87"
          emissiveIntensity={on ? 2.2 : 0.25}
          side={DoubleSide}
        />
      </mesh>
      <pointLight
        position={[0, h - 0.15, 0]}
        color="#ffb46b"
        intensity={on ? 14 : 1.2}
        distance={8}
        decay={1.5}
        castShadow={on}
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.001}
      />
    </group>
  );
}
