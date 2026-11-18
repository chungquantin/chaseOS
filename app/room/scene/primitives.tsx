"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  Vector2,
  type BufferGeometry,
  type InstancedMesh,
  type Material as ThreeMaterial,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { C, hdr } from "./materials";
import { usePBR } from "./pbr";

const NS_WOOD = new Vector2(0.55, 0.55);
const NS_FABRIC = new Vector2(0.6, 0.6);
const NS_PLASTER = new Vector2(0.35, 0.35);

export type V3 = [number, number, number];

type BoxProps = {
  p?: V3;
  s: V3;
  c: string;
  rot?: V3;
  /** corner radius (rounded boxes only) */
  r?: number;
  rough?: number;
  metal?: number;
  /** emissive glow colour + strength (strength > 1 blooms) */
  glow?: [string, number];
  /** what it's made of; defaults to a guess from the palette colour */
  mat?: Surface;
  shadow?: boolean;
  children?: ReactNode;
};

export type Surface = "wood" | "fabric" | "metal" | "plastic" | "plaster" | "plain";

/** Palette colours that are clearly one material. */
const SURFACE: Record<string, Surface> = {
  [C.woodDark]: "wood",
  [C.woodMid]: "wood",
  [C.woodLight]: "wood",
  [C.wainscot]: "wood",
  [C.wainscotDark]: "wood",
  [C.sofa]: "fabric",
  [C.cushion]: "fabric",
  [C.rug]: "fabric",
  [C.curtain]: "fabric",
  [C.metal]: "metal",
  [C.brass]: "metal",
  [C.black]: "plastic",
  [C.charcoal]: "plastic",
  [C.wall]: "plaster",
};

/*
 * Shared geometry and materials. The room and street are built from a few
 * hundred boxes, most of them identical (every chibi and scooter repeats the
 * same parts), so each distinct shape and look is created once. That keeps
 * load time and GPU memory down. Meshes using these pass dispose={null} so
 * unmounting one never disposes what others still use.
 */
const geometries = new Map<string, BufferGeometry>();
const materials = new Map<string, ThreeMaterial>();
const r3 = (n: number) => Math.round(n * 1000) / 1000;

function geometry(key: string, make: () => BufferGeometry) {
  let g = geometries.get(key);
  if (!g) geometries.set(key, (g = make()));
  return g;
}

type PBR = NonNullable<ReturnType<typeof usePBR>>;

function surfaceMaterial(pbr: PBR | null, c: string, rough: number | undefined, metal: number, glow: [string, number] | undefined, mat: Surface | undefined) {
  const kind = mat ?? SURFACE[c.toLowerCase()] ?? "plain";
  const plain = !pbr || glow || kind === "plain";
  const key = `${plain ? "plain" : kind}|${c}|${rough}|${metal}|${glow?.join(",")}|${pbr ? 1 : 0}`;
  let m = materials.get(key);
  if (m) return m;
  if (plain) {
    m = new MeshStandardMaterial({
      color: c,
      roughness: rough ?? 0.75,
      metalness: metal,
      emissive: new Color(glow ? glow[0] : "#000000"),
      emissiveIntensity: glow ? glow[1] : 0,
    });
  } else {
    switch (kind) {
      case "wood":
        m = new MeshStandardMaterial({
          color: c,
          roughness: rough ?? 0.62,
          roughnessMap: pbr!.tiled("walnutRough", 1.5),
          normalMap: pbr!.tiled("walnutNormal", 1.5),
          normalScale: NS_WOOD,
          envMapIntensity: 1.3,
        });
        break;
      case "fabric":
        m = new MeshStandardMaterial({ color: c, roughness: rough ?? 0.92, normalMap: pbr!.tiled("velvetNormal", 3), normalScale: NS_FABRIC });
        break;
      case "metal":
        m = new MeshStandardMaterial({ color: c, metalness: 1, roughness: rough ?? 0.3, envMapIntensity: 2.2 });
        break;
      case "plastic":
        m = new MeshStandardMaterial({ color: c, roughness: rough ?? 0.38, envMapIntensity: 1.3 });
        break;
      default:
        m = new MeshStandardMaterial({
          color: c,
          roughness: rough ?? 0.95,
          roughnessMap: pbr!.tiled("plasterRough", 2),
          normalMap: pbr!.tiled("plasterNormal", 2),
          normalScale: NS_PLASTER,
        });
    }
  }
  materials.set(key, m);
  return m;
}

function useSurface(c: string, rough: number | undefined, metal = 0, glow?: [string, number], mat?: Surface) {
  return surfaceMaterial(usePBR(), c, rough, metal, glow, mat);
}

/** A surface material as a JSX child (for custom geometry). */
function Material({ c, rough, metal = 0, glow, mat }: Pick<BoxProps, "c" | "rough" | "metal" | "glow" | "mat">) {
  const m = useSurface(c, rough, metal, glow, mat);
  return <primitive object={m} attach="material" dispose={null} />;
}

/** Rounded box: the default building block — soft edges catch light like the references. */
export function RBox({ p, s, c, rot, r = 0.035, rough, metal, glow, mat, shadow = true }: BoxProps) {
  const radius = Math.max(0.002, Math.min(r, Math.min(...s) / 2 - 0.002));
  const g = geometry(`rb|${s.map(r3)}|${r3(radius)}`, () => new RoundedBoxGeometry(s[0], s[1], s[2], 3, radius));
  const m = useSurface(c, rough, metal, glow, mat);
  return <mesh geometry={g} material={m} position={p} rotation={rot} castShadow={shadow} receiveShadow dispose={null} />;
}

/** Sharp box for tiny or flush details. */
export function Box({ p, s, c, rot, rough, metal, glow, mat, shadow = true }: BoxProps) {
  const g = geometry(`box|${s.map(r3)}`, () => new BoxGeometry(s[0], s[1], s[2]));
  const m = useSurface(c, rough, metal, glow, mat);
  return <mesh geometry={g} material={m} position={p} rotation={rot} castShadow={shadow} receiveShadow dispose={null} />;
}

/** Unlit, tone-mapping-free material for screens and neon. */
export function Glow({ c, i = 2.5, opacity }: { c: string; i?: number; opacity?: number }) {
  return (
    <meshBasicMaterial
      color={hdr(c, i)}
      toneMapped={false}
      transparent={opacity !== undefined}
      opacity={opacity ?? 1}
    />
  );
}

export function Cyl({
  p,
  args,
  c,
  rot,
  rough,
  metal,
  glow,
  mat,
  shadow = true,
}: {
  p?: V3;
  args: [number, number, number, number?];
  c: string;
  rot?: V3;
  rough?: number;
  metal?: number;
  glow?: [string, number];
  mat?: Surface;
  shadow?: boolean;
}) {
  const seg = args[3] ?? 24;
  const g = geometry(`cyl|${args.slice(0, 3).map((n) => r3(n ?? 0))}|${seg}`, () => new CylinderGeometry(args[0], args[1], args[2], seg));
  const m = useSurface(c, rough, metal, glow, mat);
  return <mesh geometry={g} material={m} position={p} rotation={rot} castShadow={shadow} receiveShadow dispose={null} />;
}

export function Ball({
  p,
  r,
  c,
  rough,
  metal,
  glow,
  mat,
  seg = 24,
}: {
  p?: V3;
  r: number;
  c: string;
  rough?: number;
  metal?: number;
  glow?: [string, number];
  mat?: Surface;
  seg?: number;
}) {
  const g = geometry(`ball|${r3(r)}|${seg}`, () => new SphereGeometry(r, seg, seg));
  const m = useSurface(c, rough, metal, glow, mat);
  return <mesh geometry={g} material={m} position={p} castShadow receiveShadow dispose={null} />;
}

export type Inst = { p: V3; s: V3; c: string; rot?: V3 };

/**
 * Many similar meshes in one draw call. `s` scales the unit geometry (a 1×1×1
 * box by default). Use for books, holds, grooves… anything numerous and static.
 */
export function Instanced({
  items,
  rough = 0.75,
  flat = false,
  shadow = true,
  children,
}: {
  items: Inst[];
  rough?: number;
  flat?: boolean;
  shadow?: boolean;
  /** geometry element; defaults to a unit box */
  children?: ReactNode;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current!;
    const o = new Object3D();
    const col = new Color();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.rotation.set(...(it.rot ?? [0, 0, 0]));
      o.scale.set(...it.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, col.set(it.c));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh key={items.length} ref={ref} args={[undefined, undefined, items.length]} castShadow={shadow} receiveShadow>
      {children ?? <boxGeometry />}
      <meshStandardMaterial roughness={rough} flatShading={flat} />
    </instancedMesh>
  );
}

export { Material as SurfaceMaterial };
