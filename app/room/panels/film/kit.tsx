"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Quaternion, Vector3, type Group } from "three";
import { Anim, ease, lerp, lerp3, seg, Solid, type Clock, type Pose, type V3 } from "./lowpoly";
import { T } from "./timeline";

/** Shared pieces for the Architect scenes. */

export const B = (k: keyof typeof T) => T[k][0];
export const E = (k: keyof typeof T) => T[k][1];

/** Position along a polyline for u in 0..1 (equal speed). */
export function along(route: V3[], u: number): V3 {
  const lens = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1], p[2] - route[i][2]));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = u * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) return lerp3(route[i], route[i + 1], lens[i] ? d / lens[i] : 0);
    d -= lens[i];
  }
  return route[route.length - 1];
}

/** Cubes streaming along a route between `from` and `to` seconds. */
export function Flow({
  clock,
  route,
  from,
  to,
  c,
  period = 1.3,
  count = 3,
  size = 0.3,
  kind = "box",
  lift = 0.35,
}: {
  clock: Clock;
  route: V3[];
  from: number;
  to: number;
  c: string;
  period?: number;
  count?: number;
  size?: number;
  kind?: "box" | "octa" | "sphere";
  lift?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = clock.current;
    g.children.forEach((m, i) => {
      const local = t - from - (i * period) / count;
      const on = local >= 0 && t < to + period;
      const u = (((local % period) + period) % period) / period;
      const fade = Math.min(1, seg(t, from, from + 0.4)) * (t < to ? 1 : Math.max(0, 1 - (t - to) / period));
      m.visible = on && fade > 0.02;
      const p = along(route, u);
      m.position.set(p[0], p[1] + Math.sin(u * Math.PI) * lift, p[2]);
      m.rotation.y = t * 2 + i;
      m.scale.setScalar(size * fade * (0.6 + 0.4 * Math.sin(u * Math.PI)));
    });
  });
  return (
    <group ref={ref}>
      {Array.from({ length: count }, (_, i) => (
        <Solid key={i} kind={kind} c={c} glow={1.1} shadow={false} />
      ))}
    </group>
  );
}

/** A thin glowing line between two points, visible only between t0 and t1. */
export function Link({ clock, a, b, t0, t1, c, w = 0.05, flicker = false }: { clock: Clock; a: V3; b: V3; t0: number; t1: number; c: string; w?: number; flicker?: boolean }) {
  const { mid, len, quat } = useMemo(() => {
    const va = new Vector3(...a);
    const vb = new Vector3(...b);
    const d = vb.clone().sub(va);
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.clone().normalize());
    return { mid: va.clone().add(vb).multiplyScalar(0.5), len: d.length(), quat: q };
  }, [a, b]);
  return (
    <Anim
      clock={clock}
      update={(g, t) => {
        const on = t >= t0 && t <= t1;
        g.visible = on && (!flicker || Math.sin(t * 40) > -0.4);
      }}
    >
      <mesh position={mid} quaternion={quat}>
        <cylinderGeometry args={[w, w, len, 6]} />
        <meshBasicMaterial color={c} transparent opacity={0.8} blending={AdditiveBlending} toneMapped={false} depthWrite={false} />
      </mesh>
    </Anim>
  );
}

/** Walk from one spot to another between a and b, with a natural stride. */
export const walk = (t: number, a: number, b: number, from: V3, to: V3): Pose => {
  const k = ease(seg(t, a, b));
  const moving = k > 0 && k < 1;
  const sw = Math.sin(t * 9) * (moving ? 0.6 : 0);
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  return {
    x: lerp(from[0], to[0], k),
    z: lerp(from[2], to[2], k),
    ry: Math.atan2(dx, dz),
    legs: sw,
    armL: [-sw * 0.8, 0.08],
    armR: [sw * 0.8, -0.08],
    bob: moving ? Math.abs(Math.sin(t * 9)) * 0.04 : 0,
  };
};

/** Typing pose: facing `ry`, forearms forward, fingers busy. */
export const typing = (t: number, x: number, z: number, ry: number, speed = 11): Pose => ({
  x,
  z,
  ry,
  bob: Math.abs(Math.sin(t * 5)) * 0.012,
  armL: [-1.25 + Math.sin(t * speed) * 0.12, 0.2],
  armR: [-1.25 - Math.sin(t * speed) * 0.12, -0.2],
  headX: 0.1,
});
