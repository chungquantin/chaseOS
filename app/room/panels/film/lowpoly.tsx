"use client";

import { useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace, type Group } from "three";

/**
 * Building blocks for the low-poly films: flat-shaded solids, canvas labels and
 * a faceted version of the chibi character. Everything animates as a pure
 * function of the film clock, so scrubbing and pausing just work.
 */

export type Clock = MutableRefObject<number>;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** 0 → 1 progress of t between a and b. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const ease = (x: number) => x * x * (3 - 2 * x);
export const easeOut = (x: number) => 1 - (1 - x) * (1 - x) * (1 - x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export const PAL = {
  ink: "#0b1220",
  slate: "#1e293b",
  slate2: "#334155",
  slate3: "#475569",
  paper: "#e2e8f0",
  cyan: "#38bdf8",
  violet: "#a78bfa",
  amber: "#fbbf24",
  green: "#34d399",
  red: "#f87171",
  orange: "#fb923c",
  pink: "#f472b6",
  skin: "#f0be93",
  hair: "#2a1d16",
  hoodie: "#2b2b34",
  pants: "#34435e",
  shoe: "#f4f1ea",
};

type Kind = "box" | "octa" | "ico" | "cone" | "cyl" | "tetra" | "torus" | "sphere";

/** One flat-shaded solid. `s` scales it; `glow` makes it emissive. */
export function Solid({
  kind = "box",
  p,
  s = 1,
  c,
  glow,
  rot,
  sides = 6,
  tube = 0.12,
  opacity,
  rough = 0.85,
  shadow = true,
  children,
}: {
  kind?: Kind;
  p?: V3;
  s?: number | V3;
  c: string;
  glow?: number;
  rot?: V3;
  sides?: number;
  /** torus tube thickness (relative to its 0.5 radius) */
  tube?: number;
  opacity?: number;
  rough?: number;
  shadow?: boolean;
  children?: ReactNode;
}) {
  const scale = typeof s === "number" ? ([s, s, s] as V3) : s;
  return (
    <mesh position={p} scale={scale} rotation={rot} castShadow={shadow} receiveShadow>
      {kind === "box" && <boxGeometry />}
      {kind === "octa" && <octahedronGeometry args={[0.5, 0]} />}
      {kind === "ico" && <icosahedronGeometry args={[0.5, 0]} />}
      {kind === "tetra" && <tetrahedronGeometry args={[0.5, 0]} />}
      {kind === "cone" && <coneGeometry args={[0.5, 1, sides]} />}
      {kind === "cyl" && <cylinderGeometry args={[0.5, 0.5, 1, sides]} />}
      {kind === "torus" && <torusGeometry args={[0.5, tube, 5, tube < 0.08 ? 28 : 10]} />}
      {kind === "sphere" && <icosahedronGeometry args={[0.5, 1]} />}
      <meshStandardMaterial
        color={c}
        flatShading
        roughness={rough}
        emissive={glow ? c : "#000000"}
        emissiveIntensity={glow ?? 0}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
      />
      {children}
    </mesh>
  );
}

/** A hexagonal slab to stand a diorama on, with a glowing rim and a faint grid. */
export function Island({ r = 10, c = PAL.slate, top = PAL.slate2 }: { r?: number; c?: string; top?: string }) {
  const inner = r * 0.84;
  const lines = Array.from({ length: Math.floor((inner * 2) / 2.4) + 1 }, (_, i) => -inner + 1.2 + i * 2.4).filter((v) => Math.abs(v) < inner - 0.4);
  return (
    <group>
      <Solid kind="cyl" p={[0, -0.7, 0]} s={[r * 2, 1.4, r * 2]} c={c} sides={6} rot={[0, Math.PI / 6, 0]} />
      <Solid kind="cyl" p={[0, 0.02, 0]} s={[r * 2 - 0.1, 0.06, r * 2 - 0.1]} c={PAL.cyan} glow={0.9} sides={6} rot={[0, Math.PI / 6, 0]} shadow={false} />
      <Solid kind="cyl" p={[0, 0.045, 0]} s={[r * 2 - 0.5, 0.06, r * 2 - 0.5]} c={top} sides={6} rot={[0, Math.PI / 6, 0]} />
      {lines.map((v) => {
        const len = 2 * Math.sqrt(Math.max(0.5, inner * inner - v * v)) * 0.98;
        return (
          <group key={v}>
            <Solid p={[v, 0.085, 0]} s={[0.03, 0.01, len]} c={PAL.slate3} shadow={false} />
            <Solid p={[0, 0.085, v]} s={[len, 0.01, 0.03]} c={PAL.slate3} shadow={false} />
          </group>
        );
      })}
    </group>
  );
}

/** A canvas-textured text plate that always faces the camera. */
export function Label({
  text,
  p,
  w = 2.4,
  h = 0.6,
  bg = "#0b1220",
  fg = "#e2e8f0",
  accent,
  opacity = 1,
  font = 56,
}: {
  text: string;
  p: V3;
  w?: number;
  h?: number;
  bg?: string;
  fg?: string;
  accent?: string;
  opacity?: number;
  font?: number;
}) {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = Math.round(512 * (h / w));
    const g = cv.getContext("2d")!;
    const r = cv.height * 0.28;
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(0, 0, cv.width, cv.height, r);
    g.fill();
    if (accent) {
      g.fillStyle = accent;
      g.beginPath();
      g.roundRect(0, 0, cv.height * 0.22, cv.height, [r, 0, 0, r]);
      g.fill();
    }
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 ${font * (cv.height / 128)}px ui-sans-serif, system-ui, sans-serif`;
    g.fillText(text, cv.width / 2 + (accent ? cv.height * 0.08 : 0), cv.height / 2 + 3);
    const t = new CanvasTexture(cv);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [text, w, h, bg, fg, accent, font]);
  return (
    <Billboard position={p} follow lockX lockZ>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent opacity={opacity} toneMapped={false} depthWrite={false} />
      </mesh>
    </Billboard>
  );
}

/** Group that animates every frame from the film clock. */
export function Anim({ clock, update, children }: { clock: Clock; update: (g: Group, t: number) => void; children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current) update(ref.current, clock.current);
  });
  return <group ref={ref}>{children}</group>;
}

export type Pose = {
  x: number;
  y?: number;
  z: number;
  /** facing: 0 looks toward +z */
  ry?: number;
  legs?: number;
  /** shoulder x-rotation (negative = forward/up) and z-rotation (outward) */
  armL?: [number, number];
  armR?: [number, number];
  bob?: number;
  headZ?: number;
  headX?: number;
  sit?: boolean;
};

/** The mascot, faceted: same silhouette as the in-app character, glasses and all. */
export function FilmChibi({ clock, pose, scale = 1.15 }: { clock: Clock; pose: (t: number) => Pose; scale?: number }) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  useFrame(() => {
    const p = pose(clock.current);
    root.current!.position.set(p.x, p.y ?? 0, p.z);
    root.current!.rotation.y = p.ry ?? 0;
    body.current!.position.y = (p.bob ?? 0) - (p.sit ? 0.26 : 0);
    const lg = p.sit ? -1.35 : p.legs ?? 0;
    legL.current!.rotation.x = lg;
    legR.current!.rotation.x = p.sit ? -1.35 : -(p.legs ?? 0);
    armL.current!.rotation.set(p.armL?.[0] ?? 0, 0, p.armL?.[1] ?? 0.08);
    armR.current!.rotation.set(p.armR?.[0] ?? 0, 0, p.armR?.[1] ?? -0.08);
    head.current!.rotation.set(p.headX ?? 0, 0, p.headZ ?? 0);
  });
  const dark = "#14141a";
  return (
    <group ref={root} scale={scale}>
      <group ref={body}>
        <group ref={legL} position={[-0.08, 0.36, 0]}>
          <Solid p={[0, -0.16, 0]} s={[0.12, 0.3, 0.13]} c={PAL.pants} />
          <Solid p={[0, -0.32, 0.025]} s={[0.13, 0.07, 0.19]} c={PAL.shoe} />
        </group>
        <group ref={legR} position={[0.08, 0.36, 0]}>
          <Solid p={[0, -0.16, 0]} s={[0.12, 0.3, 0.13]} c={PAL.pants} />
          <Solid p={[0, -0.32, 0.025]} s={[0.13, 0.07, 0.19]} c={PAL.shoe} />
        </group>
        <Solid p={[0, 0.56, 0]} s={[0.36, 0.42, 0.24]} c={PAL.hoodie} />
        <Solid p={[0, 0.48, 0.12]} s={[0.2, 0.1, 0.03]} c="#e8642f" glow={0.25} />
        <group ref={armL} position={[-0.22, 0.72, 0]}>
          <Solid p={[0, -0.15, 0]} s={[0.1, 0.32, 0.11]} c={PAL.hoodie} />
          <Solid p={[0, -0.33, 0]} s={[0.08, 0.07, 0.08]} c={PAL.skin} />
        </group>
        <group ref={armR} position={[0.22, 0.72, 0]}>
          <Solid p={[0, -0.15, 0]} s={[0.1, 0.32, 0.11]} c={PAL.hoodie} />
          <Solid p={[0, -0.33, 0]} s={[0.08, 0.07, 0.08]} c={PAL.skin} />
        </group>
        <group ref={head} position={[0, 0.86, 0]}>
          <Solid p={[0, 0.14, 0]} s={[0.42, 0.4, 0.38]} c={PAL.skin} />
          <Solid p={[0, 0.34, -0.02]} s={[0.46, 0.13, 0.42]} c={PAL.hair} />
          <Solid p={[0, 0.18, -0.17]} s={[0.44, 0.3, 0.1]} c={PAL.hair} />
          <Solid p={[0.02, 0.3, 0.17]} s={[0.2, 0.09, 0.06]} c={PAL.hair} rot={[0, 0, -0.25]} />
          <Solid p={[-0.215, 0.21, 0.06]} s={[0.03, 0.16, 0.2]} c={PAL.hair} />
          <Solid p={[0.215, 0.21, 0.06]} s={[0.03, 0.16, 0.2]} c={PAL.hair} />
          {[-0.09, 0.09].map((x) => (
            <group key={x}>
              <Solid p={[x, 0.14, 0.195]} s={[0.05, 0.07, 0.02]} c="#1b1b1b" />
              <Solid kind="torus" p={[x, 0.14, 0.2]} s={[0.26, 0.24, 0.1]} c={dark} />
              <Solid p={[x * 1.6, 0.06, 0.19]} s={[0.065, 0.032, 0.01]} c="#f08f7a" />
            </group>
          ))}
          <Solid p={[0, 0.045, 0.19]} s={[0.07, 0.016, 0.01]} c="#7a4332" />
        </group>
      </group>
    </group>
  );
}

/** A little cloud of confetti shards that rains down in a loop. */
export function Confetti({ clock, center, on, count = 46 }: { clock: Clock; center: V3; on: number; count?: number }) {
  const ref = useRef<Group>(null);
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: ((i * 37) % 100) / 100 - 0.5,
        z: ((i * 53) % 100) / 100 - 0.5,
        s: 0.7 + ((i * 29) % 10) / 14,
        c: [PAL.cyan, PAL.amber, PAL.pink, PAL.green, PAL.violet, PAL.orange][i % 6],
        speed: 0.5 + ((i * 17) % 10) / 12,
        spin: 1 + (i % 5),
      })),
    [count]
  );
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = clock.current - on;
    g.visible = t > 0;
    g.children.forEach((m, i) => {
      const b = bits[i];
      const fall = ((t * b.speed + i * 0.13) % 3.2) / 3.2;
      m.position.set(b.x * 9, 6.5 - fall * 7, b.z * 6);
      m.rotation.set(t * b.spin, t * b.spin * 0.7, 0);
    });
  });
  return (
    <group ref={ref} position={center}>
      {bits.map((b, i) => (
        <Solid key={i} kind="tetra" s={0.22 * b.s} c={b.c} glow={0.35} />
      ))}
    </group>
  );
}
