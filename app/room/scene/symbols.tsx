"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ChapterId } from "app/data/career";
import { Ball, Box, Cyl, RBox } from "./primitives";

/**
 * One small sculpture per job, each from the chapter's `symbol` in
 * app/data/career.ts. Local origin is the top of the plinth.
 */

function Spin({ speed = 0.5, children }: { speed?: number; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return <group ref={ref}>{children}</group>;
}

const FLAKES = Array.from({ length: 16 }, (_, i) => {
  const a = i * 2.4;
  const r = 0.12 + ((i * 37) % 10) * 0.025;
  return [Math.cos(a) * r, 0.25 + ((i * 53) % 10) * 0.045, Math.sin(a) * r] as [number, number, number];
});

function SnowGlobe() {
  return (
    <group>
      <Cyl p={[0, 0.08, 0]} args={[0.34, 0.4, 0.16, 28]} c="#3b3f4a" mat="metal" />
      <Box p={[0, 0.21, 0]} s={[0.18, 0.1, 0.18]} c="#1f2430" />
      <Box p={[0, 0.21, 0.092]} s={[0.05, 0.035, 0.01]} c="#22c55e" glow={["#22c55e", 3.5]} />
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshPhysicalMaterial color="#cfe6ff" transparent opacity={0.26} roughness={0.05} metalness={0.1} depthWrite={false} />
      </mesh>
      <Spin speed={0.4}>
        {FLAKES.map((p, i) => (
          <Ball key={i} p={[p[0], p[1] + 0.2, p[2]]} r={0.018} c="#ffffff" glow={["#ffffff", 1.2]} />
        ))}
      </Spin>
    </group>
  );
}

function InferenceRack() {
  return (
    <group>
      {[-0.32, 0.32].flatMap((x) => [-0.22, 0.22].map((z) => <Box key={`${x}${z}`} p={[x, 0.55, z]} s={[0.04, 1.1, 0.04]} c="#2c2f36" mat="metal" />))}
      {[0.14, 0.4, 0.66, 0.92].map((y, i) => (
        <group key={y}>
          <RBox p={[0, y, 0]} s={[0.62, 0.2, 0.42]} c={i % 2 ? "#23262d" : "#2e323b"} r={0.02} />
          <Box p={[-0.22, y, 0.212]} s={[0.06, 0.03, 0.01]} c="#f97316" glow={["#f97316", 3]} />
          <Box p={[-0.12, y, 0.212]} s={[0.06, 0.03, 0.01]} c={i % 3 ? "#22c55e" : "#38bdf8"} glow={[i % 3 ? "#22c55e" : "#38bdf8", 3]} />
          <Box p={[0.12, y, 0.212]} s={[0.26, 0.05, 0.01]} c="#12141a" />
        </group>
      ))}
    </group>
  );
}

function GuildBanner({ brand }: { brand: string }) {
  return (
    <group>
      <Cyl p={[0, 0.7, 0]} args={[0.025, 0.03, 1.4, 12]} c="#8a6a3a" mat="wood" />
      <Box p={[0, 1.36, 0]} s={[0.7, 0.04, 0.04]} c="#8a6a3a" mat="wood" />
      <Ball p={[0, 1.46, 0]} r={0.05} c="#e6c066" metal={0.8} />
      <RBox p={[0, 0.95, 0.03]} s={[0.58, 0.8, 0.03]} c={brand} r={0.012} rough={0.9} mat="fabric" />
      <Box p={[0, 0.5, 0.03]} s={[0.58, 0.04, 0.034]} c="#ffffff" />
      <Ball p={[0, 1.02, 0.06]} r={0.12} c="#ffffff" glow={["#ffffff", 0.6]} />
      {[-0.2, 0, 0.2].map((x) => (
        <Box key={x} p={[x, 0.46, 0.03]} s={[0.03, 0.1, 0.03]} c="#e6c066" />
      ))}
    </group>
  );
}

function Whiteboard() {
  const dots: [number, number][] = [[-0.3, 1.05], [0, 1.1], [0.3, 1.0], [-0.15, 0.82], [0.17, 0.82]];
  return (
    <group>
      {[-0.42, 0.42].map((x) => (
        <Box key={x} p={[x, 0.45, -0.05]} s={[0.04, 0.9, 0.04]} c="#8d8f96" mat="metal" />
      ))}
      <RBox p={[0, 0.95, 0]} s={[1.05, 0.72, 0.05]} c="#f7f6f2" r={0.015} rough={0.3} />
      <Box p={[0, 0.58, 0.05]} s={[1.05, 0.03, 0.06]} c="#8d8f96" mat="metal" />
      {dots.map(([x, y], i) => (
        <Ball key={i} p={[x, y, 0.04]} r={0.06} c="#e6007a" glow={["#e6007a", 1.6]} />
      ))}
      {([[0, 1], [1, 2], [0, 3], [3, 4], [2, 4]] as const).map(([a, b], i) => {
        const [x1, y1] = dots[a];
        const [x2, y2] = dots[b];
        return (
          <Box key={i} p={[(x1 + x2) / 2, (y1 + y2) / 2, 0.035]} s={[Math.hypot(x2 - x1, y2 - y1), 0.012, 0.01]} c="#1c1917" rot={[0, 0, Math.atan2(y2 - y1, x2 - x1)]} />
        );
      })}
    </group>
  );
}

function Orrery() {
  return (
    <group position={[0, 0.7, 0]}>
      <Cyl p={[0, -0.55, 0]} args={[0.05, 0.22, 0.3, 16]} c="#3a3f4b" mat="metal" />
      <Ball p={[0, 0, 0]} r={0.14} c="#e6007a" glow={["#e6007a", 2.6]} />
      <Spin speed={0.6}>
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <torusGeometry args={[0.36, 0.012, 8, 48]} />
          <meshStandardMaterial color="#d2a542" metalness={1} roughness={0.3} />
        </mesh>
        <Ball p={[0.36, 0.05, 0]} r={0.06} c="#7dd3fc" glow={["#7dd3fc", 1.6]} />
      </Spin>
      <Spin speed={-0.9}>
        <mesh rotation={[Math.PI / 1.7, 0.4, 0]}>
          <torusGeometry args={[0.55, 0.012, 8, 56]} />
          <meshStandardMaterial color="#d2a542" metalness={1} roughness={0.3} />
        </mesh>
        <Ball p={[-0.55, 0.08, 0]} r={0.075} c="#a78bfa" glow={["#a78bfa", 1.6]} />
        <Ball p={[0.1, 0.5, 0.2]} r={0.045} c="#fbbf24" glow={["#fbbf24", 1.6]} />
      </Spin>
    </group>
  );
}

function Refinery({ brand }: { brand: string }) {
  return (
    <group>
      <Cyl p={[-0.3, 0.45, 0]} args={[0.2, 0.2, 0.9, 20]} c="#c9ced6" mat="metal" />
      <Cyl p={[0.05, 0.6, 0.05]} args={[0.17, 0.17, 1.2, 20]} c="#b7bdc7" mat="metal" />
      <Cyl p={[0.38, 0.35, -0.02]} args={[0.15, 0.15, 0.7, 20]} c="#c9ced6" mat="metal" />
      <Box p={[0.05, 1.28, 0.05]} s={[0.1, 0.16, 0.1]} c="#3a3f4b" />
      <Box p={[0.05, 1.37, 0.05]} s={[0.06, 0.04, 0.06]} c={brand} glow={[brand, 3]} />
      <Box p={[-0.12, 0.75, 0.2]} s={[0.55, 0.05, 0.05]} c="#3a3f4b" mat="metal" />
      <Box p={[0.22, 0.45, 0.2]} s={[0.05, 0.6, 0.05]} c="#3a3f4b" mat="metal" />
      <RBox p={[0, 0.07, 0.22]} s={[0.9, 0.14, 0.3]} c="#2a2d34" r={0.03} />
      <Box p={[-0.2, 0.15, 0.38]} s={[0.1, 0.05, 0.02]} c="#22c55e" glow={["#22c55e", 3]} />
      <Box p={[0.1, 0.15, 0.38]} s={[0.1, 0.05, 0.02]} c={brand} glow={[brand, 3]} />
    </group>
  );
}

function TradingDesk() {
  const bars = [0.04, 0.09, 0.06, 0.12, 0.1, 0.16, 0.13];
  return (
    <group>
      {[-0.55, 0.55].map((x) => (
        <Box key={x} p={[x, 0.3, 0]} s={[0.06, 0.6, 0.5]} c="#2c2f36" mat="metal" />
      ))}
      <RBox p={[0, 0.62, 0]} s={[1.3, 0.07, 0.6]} c="#8a5a3a" r={0.02} mat="wood" />
      {[-0.42, 0, 0.42].map((x, i) => (
        <group key={x} position={[x, 0.66, -0.1]} rotation={[0, -x * 0.5, 0]}>
          <Box p={[0, 0.04, 0]} s={[0.05, 0.08, 0.05]} c="#2c2f36" />
          <RBox p={[0, 0.26, 0]} s={[0.4, 0.28, 0.03]} c="#14161c" r={0.012} />
          <Box p={[0, 0.26, 0.017]} s={[0.36, 0.24, 0.004]} c="#0b1a14" glow={i === 1 ? ["#0b3b2a", 1.4] : ["#0b2a3b", 1.2]} />
          {bars.map((h, k) => (
            <Box key={k} p={[-0.13 + k * 0.045, 0.17 + h / 2, 0.02]} s={[0.025, h, 0.004]} c={k % 3 ? "#22c55e" : "#ef4444"} glow={[k % 3 ? "#22c55e" : "#ef4444", 2.6]} />
          ))}
        </group>
      ))}
      <RBox p={[0, 0.67, 0.18]} s={[0.5, 0.025, 0.16]} c="#1f2430" r={0.01} />
    </group>
  );
}

export function JobSymbol({ id, brand }: { id: ChapterId; brand: string }) {
  switch (id) {
    case "snowflake":
      return <SnowGlobe />;
    case "amazely":
      return <InferenceRack />;
    case "openguild":
      return <GuildBanner brand={brand} />;
    case "polkadot":
      return <Whiteboard />;
    case "rogue":
      return <Orrery />;
    case "rover":
      return <Refinery brand={brand} />;
    case "architect":
      return <TradingDesk />;
  }
}
