"use client";

import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Color, Object3D, Vector2, type InstancedMesh } from "three";

const NS_WOOD = new Vector2(0.55, 0.55);
const NS_FABRIC = new Vector2(0.6, 0.6);
const NS_PLASTER = new Vector2(0.35, 0.35);
import { C, hdr } from "./materials";
import { usePBR } from "./pbr";

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

const sheenOf = (c: string) => new Color(c).lerp(new Color("#ffffff"), 0.35);

function Material({ c, rough, metal = 0, glow, mat }: Pick<BoxProps, "c" | "rough" | "metal" | "glow" | "mat">) {
  const pbr = usePBR();
  const kind = mat ?? SURFACE[c.toLowerCase()] ?? "plain";
  if (!pbr || glow || kind === "plain") {
    return (
      <meshStandardMaterial
        color={c}
        roughness={rough ?? 0.75}
        metalness={metal}
        emissive={glow ? glow[0] : "#000000"}
        emissiveIntensity={glow ? glow[1] : 0}
      />
    );
  }
  switch (kind) {
    case "wood":
      return (
        <meshStandardMaterial
          color={c}
          roughness={rough ?? 0.62}
          roughnessMap={pbr.tiled("walnutRough", 1.5)}
          normalMap={pbr.tiled("walnutNormal", 1.5)}
          normalScale={NS_WOOD}
          envMapIntensity={1.3}
        />
      );
    case "fabric":
      return (
        <meshPhysicalMaterial
          color={c}
          roughness={rough ?? 0.92}
          normalMap={pbr.tiled("velvetNormal", 3)}
          normalScale={NS_FABRIC}
          sheen={1}
          sheenRoughness={0.55}
          sheenColor={sheenOf(c)}
        />
      );
    case "metal":
      return <meshStandardMaterial color={c} metalness={1} roughness={rough ?? 0.3} envMapIntensity={2.2} />;
    case "plastic":
      return <meshPhysicalMaterial color={c} roughness={rough ?? 0.4} clearcoat={0.45} clearcoatRoughness={0.35} />;
    case "plaster":
      return (
        <meshStandardMaterial
          color={c}
          roughness={rough ?? 0.95}
          roughnessMap={pbr.tiled("plasterRough", 2)}
          normalMap={pbr.tiled("plasterNormal", 2)}
          normalScale={NS_PLASTER}
        />
      );
  }
}

/** Rounded box: the default building block — soft edges catch light like the references. */
export function RBox({ p, s, c, rot, r = 0.035, rough, metal, glow, mat, shadow = true }: BoxProps) {
  const radius = Math.max(0.002, Math.min(r, Math.min(...s) / 2 - 0.002));
  return (
    <RoundedBox
      args={s}
      radius={radius}
      smoothness={3}
      position={p}
      rotation={rot}
      castShadow={shadow}
      receiveShadow
    >
      <Material c={c} rough={rough} metal={metal} glow={glow} mat={mat} />
    </RoundedBox>
  );
}

/** Sharp box for tiny or flush details. */
export function Box({ p, s, c, rot, rough, metal, glow, mat, shadow = true }: BoxProps) {
  return (
    <mesh position={p} rotation={rot} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
      <Material c={c} rough={rough} metal={metal} glow={glow} mat={mat} />
    </mesh>
  );
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
  return (
    <mesh position={p} rotation={rot} castShadow={shadow} receiveShadow>
      <cylinderGeometry args={[args[0], args[1], args[2], args[3] ?? 24]} />
      <Material c={c} rough={rough} metal={metal} glow={glow} mat={mat} />
    </mesh>
  );
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
  return (
    <mesh position={p} castShadow receiveShadow>
      <sphereGeometry args={[r, seg, seg]} />
      <Material c={c} rough={rough} metal={metal} glow={glow} mat={mat} />
    </mesh>
  );
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
