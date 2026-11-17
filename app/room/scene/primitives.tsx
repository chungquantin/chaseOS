"use client";

import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Color, Object3D, type InstancedMesh } from "three";
import { hdr } from "./materials";

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
  shadow?: boolean;
  children?: ReactNode;
};

function Material({ c, rough = 0.75, metal = 0, glow }: Pick<BoxProps, "c" | "rough" | "metal" | "glow">) {
  return (
    <meshStandardMaterial
      color={c}
      roughness={rough}
      metalness={metal}
      emissive={glow ? glow[0] : "#000000"}
      emissiveIntensity={glow ? glow[1] : 0}
    />
  );
}

/** Rounded box: the default building block — soft edges catch light like the references. */
export function RBox({ p, s, c, rot, r = 0.035, rough, metal, glow, shadow = true }: BoxProps) {
  const radius = Math.max(0.002, Math.min(r, Math.min(...s) / 2 - 0.002));
  return (
    <RoundedBox
      args={s}
      radius={radius}
      smoothness={2}
      position={p}
      rotation={rot}
      castShadow={shadow}
      receiveShadow
    >
      <Material c={c} rough={rough} metal={metal} glow={glow} />
    </RoundedBox>
  );
}

/** Sharp box for tiny or flush details. */
export function Box({ p, s, c, rot, rough, metal, glow, shadow = true }: BoxProps) {
  return (
    <mesh position={p} rotation={rot} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
      <Material c={c} rough={rough} metal={metal} glow={glow} />
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
  shadow = true,
}: {
  p?: V3;
  args: [number, number, number, number?];
  c: string;
  rot?: V3;
  rough?: number;
  metal?: number;
  glow?: [string, number];
  shadow?: boolean;
}) {
  return (
    <mesh position={p} rotation={rot} castShadow={shadow} receiveShadow>
      <cylinderGeometry args={[args[0], args[1], args[2], args[3] ?? 20]} />
      <Material c={c} rough={rough} metal={metal} glow={glow} />
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
  seg = 20,
}: {
  p?: V3;
  r: number;
  c: string;
  rough?: number;
  metal?: number;
  glow?: [string, number];
  seg?: number;
}) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <sphereGeometry args={[r, seg, seg]} />
      <Material c={c} rough={rough} metal={metal} glow={glow} />
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
