"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BackSide, DirectionalLight, Object3D, type Group } from "three";
import { Anim, Label, PAL, Solid, seg, ease, easeOut, type Clock, type V3 } from "./lowpoly";

/* ------------------------------------------------------------- world */

/** A night sky that follows the camera: gradient dome and a field of stars. */
export function SkyDome() {
  const ref = useRef<Group>(null);
  const stars = useMemo(() => {
    const a: number[] = [];
    for (let i = 0; i < 420; i++) {
      const u = ((i * 9301 + 49297) % 233280) / 233280;
      const v = ((i * 7919 + 1237) % 104729) / 104729;
      const th = u * Math.PI * 2;
      const ph = Math.acos(1 - v * 1.1);
      a.push(Math.sin(ph) * Math.cos(th) * 150, Math.cos(ph) * 150, Math.sin(ph) * Math.sin(th) * 150);
    }
    return new Float32Array(a);
  }, []);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return (
    <group ref={ref}>
      <mesh renderOrder={-10}>
        <sphereGeometry args={[160, 24, 16]} />
        <shaderMaterial
          side={BackSide}
          depthWrite={false}
          fog={false}
          vertexShader={"varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }"}
          fragmentShader={
            "varying vec3 vP; void main(){ float h = vP.y*0.5+0.5; vec3 top=vec3(0.02,0.04,0.12); vec3 mid=vec3(0.13,0.10,0.30); vec3 low=vec3(0.30,0.17,0.36); vec3 c = mix(low, mid, smoothstep(0.42,0.62,h)); c = mix(c, top, smoothstep(0.6,1.0,h)); gl_FragColor=vec4(c,1.0); }"
          }
        />
      </mesh>
      <points renderOrder={-9}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={1.7} sizeAttenuation={false} transparent opacity={0.85} fog={false} depthWrite={false} />
      </points>
    </group>
  );
}

/** The key light follows the action so shadows stay crisp in every diorama. */
export function Sun({ clock, centers }: { clock: Clock; centers: (t: number) => number }) {
  const light = useRef<DirectionalLight>(null);
  const target = useMemo(() => new Object3D(), []);
  useFrame(() => {
    const cx = centers(clock.current);
    const l = light.current;
    if (!l) return;
    l.position.set(cx + 11, 20, 13);
    target.position.set(cx, 0, 0);
    target.updateMatrixWorld();
  });
  return (
    <>
      <primitive object={target} />
      <directionalLight
        ref={light}
        target={target}
        intensity={2.4}
        color="#ffe9d0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0006}
        shadow-radius={4}
      />
    </>
  );
}

/** Slowly drifting motes, so the air isn't empty. */
export function Dust({ r = 9, count = 70, h = 7, c = "#9ec5ff" }: { r?: number; count?: number; h?: number; c?: string }) {
  const pts = useMemo(() => {
    const a: number[] = [];
    for (let i = 0; i < count; i++) {
      const u = ((i * 9301 + 49297) % 233280) / 233280;
      const v = ((i * 7919 + 1237) % 104729) / 104729;
      const w = ((i * 6007 + 331) % 99991) / 99991;
      a.push((u - 0.5) * 2 * r, v * h + 0.4, (w - 0.5) * 2 * r);
    }
    return new Float32Array(a);
  }, [count, r, h]);
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.03;
      ref.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.25;
    }
  });
  return (
    <group ref={ref}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pts, 3]} />
        </bufferGeometry>
        <pointsMaterial color={c} size={2.4} sizeAttenuation={false} transparent opacity={0.65} depthWrite={false} blending={AdditiveBlending} />
      </points>
    </group>
  );
}

/** A soft beam of light (additive cone). */
export function Beam({ p, r = 1.2, h = 8, c = PAL.amber, opacity = 0.16, rot }: { p: V3; r?: number; h?: number; c?: string; opacity?: number; rot?: V3 }) {
  return (
    <mesh position={p} rotation={rot}>
      <coneGeometry args={[r, h, 16, 1, true]} />
      <meshBasicMaterial color={c} transparent opacity={opacity} blending={AdditiveBlending} depthWrite={false} side={2} toneMapped={false} />
    </mesh>
  );
}

/** An expanding ring: shockwaves, pings. Plays between `from` and `from + dur`. */
export function Pulse({ clock, p, from, dur = 1.2, c = PAL.red, max = 5 }: { clock: Clock; p: V3; from: number; dur?: number; c?: string; max?: number }) {
  return (
    <Anim
      clock={clock}
      update={(g, t) => {
        const k = seg(t, from, from + dur);
        g.visible = k > 0 && k < 1;
        g.scale.setScalar(Math.max(0.01, easeOut(k) * max));
        const m = g.children[0] as unknown as { material: { opacity: number } };
        if (m?.material) m.material.opacity = (1 - k) * 0.9;
      }}
    >
      <mesh position={p} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 1, 40]} />
        <meshBasicMaterial color={c} transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} toneMapped={false} side={2} />
      </mesh>
    </Anim>
  );
}

/** A burst of shards that fly outward and fall. */
export function Burst({ clock, p, from, c = PAL.red, count = 16, power = 3 }: { clock: Clock; p: V3; from: number; c?: string; count?: number; power?: number }) {
  const ref = useRef<Group>(null);
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 3) * 0.3;
        const up = 0.6 + ((i * 37) % 10) / 10;
        return { dx: Math.cos(a) * (0.6 + ((i * 17) % 10) / 12), dz: Math.sin(a) * (0.6 + ((i * 29) % 10) / 12), up, s: 0.18 + ((i * 13) % 10) / 40 };
      }),
    [count]
  );
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = clock.current - from;
    g.visible = t > 0 && t < 1.8;
    g.children.forEach((m, i) => {
      const b = bits[i];
      m.position.set(b.dx * t * power, b.up * t * power * 1.4 - 4.2 * t * t, b.dz * t * power);
      m.rotation.set(t * 6 + i, t * 4, 0);
      m.scale.setScalar(Math.max(0.001, 1 - t / 1.8));
    });
  });
  return (
    <group ref={ref} position={p}>
      {bits.map((b, i) => (
        <Solid key={i} kind="tetra" s={b.s * 2} c={c} glow={0.9} shadow={false} />
      ))}
    </group>
  );
}

/** Pops a group in: scale and rise, optionally out again. */
export function Pop({ clock, t0, t1, dur = 0.7, children, y = 0 }: { clock: Clock; t0: number; t1?: number; dur?: number; children: ReactNode; y?: number }) {
  return (
    <Anim
      clock={clock}
      update={(g, t) => {
        let k = easeOut(seg(t, t0, t0 + dur));
        if (t1 !== undefined) k *= 1 - ease(seg(t, t1, t1 + 0.5));
        g.visible = k > 0.001;
        g.scale.setScalar(Math.max(0.001, k));
        g.position.y = y + (1 - k) * -0.5;
      }}
    >
      {children}
    </Anim>
  );
}

/* ---------------------------------------------------------- glyphs */

export function Gear({ r = 0.5, teeth = 8, c = PAL.orange, glow = 0.5 }: { r?: number; teeth?: number; c?: string; glow?: number }) {
  return (
    <group>
      <Solid kind="cyl" s={[r * 2, 0.22, r * 2]} c={c} sides={14} glow={glow} />
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return <Solid key={i} p={[Math.cos(a) * r, 0, Math.sin(a) * r]} s={[r * 0.38, 0.22, r * 0.38]} rot={[0, -a, 0]} c={c} glow={glow} />;
      })}
      <Solid kind="cyl" s={[r * 0.8, 0.26, r * 0.8]} c={PAL.slate} sides={10} />
    </group>
  );
}

export function DocGlyph() {
  return (
    <group>
      <Solid s={[0.8, 1.05, 0.08]} c={PAL.paper} />
      {[0.3, 0.1, -0.1, -0.3].map((y, i) => (
        <Solid key={y} p={[i === 3 ? -0.1 : 0, y, 0.05]} s={[i === 3 ? 0.4 : 0.55, 0.07, 0.02]} c={PAL.cyan} glow={0.4} />
      ))}
    </group>
  );
}
export function PicGlyph() {
  return (
    <group>
      <Solid s={[1, 0.8, 0.1]} c={PAL.paper} />
      <Solid s={[0.84, 0.64, 0.12]} c="#1d4ed8" />
      <Solid kind="cone" p={[-0.12, -0.08, 0.08]} s={[0.5, 0.4, 0.1]} c={PAL.green} sides={3} />
      <Solid kind="sphere" p={[0.22, 0.14, 0.1]} s={0.2} c={PAL.amber} glow={0.9} />
    </group>
  );
}
export function WaveGlyph({ clock }: { clock: Clock }) {
  return (
    <group>
      <Solid s={[1, 0.8, 0.1]} c={PAL.slate} />
      {Array.from({ length: 7 }, (_, i) => (
        <Anim key={i} clock={clock} update={(g, t) => (g.scale.y = 0.25 + Math.abs(Math.sin(t * 5 + i * 0.9)) * 0.9)}>
          <Solid p={[-0.36 + i * 0.12, 0, 0.07]} s={[0.07, 0.5, 0.05]} c={PAL.pink} glow={0.8} />
        </Anim>
      ))}
    </group>
  );
}
export function VideoGlyph() {
  return (
    <group>
      <Solid s={[1.05, 0.76, 0.1]} c={PAL.slate} />
      <Solid s={[0.9, 0.62, 0.12]} c="#3b0764" />
      <Solid kind="cone" p={[0.03, 0, 0.1]} s={[0.34, 0.3, 0.1]} c={PAL.violet} sides={3} rot={[0, 0, -Math.PI / 2]} glow={0.8} />
    </group>
  );
}
export function MicGlyph() {
  return (
    <group>
      <Solid kind="cyl" p={[0, 0.2, 0]} s={[0.34, 0.6, 0.34]} c={PAL.green} sides={8} glow={0.5} />
      <Solid kind="sphere" p={[0, 0.5, 0]} s={0.36} c={PAL.green} glow={0.5} />
      <Solid kind="torus" p={[0, 0.1, 0]} s={[0.7, 0.7, 0.7]} rot={[0, 0, Math.PI]} c={PAL.slate3} />
      <Solid p={[0, -0.32, 0]} s={[0.05, 0.3, 0.05]} c={PAL.slate3} />
      <Solid p={[0, -0.48, 0]} s={[0.4, 0.05, 0.2]} c={PAL.slate3} />
    </group>
  );
}

/** Shows one label at a time, stepping through `values` between `from` and `to`. */
export function Ticker({
  clock,
  p,
  values,
  from,
  to,
  w = 1.5,
  h = 0.5,
  bg,
  fg,
  last,
}: {
  clock: Clock;
  p: V3;
  values: string[];
  from: number;
  to: number;
  w?: number;
  h?: number;
  bg?: string;
  fg?: string;
  last?: { bg: string; fg: string };
}) {
  return (
    <Anim
      clock={clock}
      update={(g, t) => {
        const k = Math.min(values.length - 1, Math.max(0, Math.floor(((t - from) / (to - from)) * values.length)));
        g.children.forEach((c, i) => (c.visible = i === k));
      }}
    >
      {values.map((v, i) => (
        <Label key={v + i} text={v} p={p} w={w} h={h} bg={i === values.length - 1 && last ? last.bg : bg} fg={i === values.length - 1 && last ? last.fg : fg} />
      ))}
    </Anim>
  );
}
