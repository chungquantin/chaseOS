"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { C } from "./materials";
import { RBox } from "./primitives";

/**
 * Neighbours, drawn exactly like the main character (same chibi build,
 * same rounded boxes) so the whole street reads as one world.
 */

export type Outfit = { top: string; pants: string; hair: string; skin?: string; accent?: string };
export type Pose = "stand" | "sit" | "ride" | "walk";

export function Chibi({
  outfit,
  pose = "stand",
  helmet,
  phase = 0,
}: {
  outfit: Outfit;
  pose?: Pose;
  /** a half-face helmet colour (riders) */
  helmet?: string;
  phase?: number;
}) {
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const body = useRef<Group>(null);
  const skin = outfit.skin ?? C.skin;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    let legs = 0;
    let arms = 0;
    let bob = 0;
    if (pose === "walk") {
      const s = Math.sin(t * 9);
      legs = s * 0.6;
      arms = s * 0.5;
      bob = Math.abs(s) * 0.035;
    }
    const sitLegs = pose === "sit" || pose === "ride" ? -1.35 : 0;
    legL.current!.rotation.x = sitLegs + legs;
    legR.current!.rotation.x = sitLegs - legs;
    const reach = pose === "ride" ? -1.15 : pose === "sit" ? -0.55 + Math.sin(t * 2.4) * 0.12 : 0;
    armL.current!.rotation.x = reach - arms * 0.8;
    armR.current!.rotation.x = reach + arms * 0.8;
    body.current!.position.y = bob;
  });

  return (
    <group scale={1.15}>
      {pose !== "ride" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} raycast={() => null}>
          <circleGeometry args={[0.24, 24]} />
          <meshBasicMaterial color="#000" transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}
      <group ref={body}>
        <group position={[0, 0.36, 0]}>
          {[legL, legR].map((ref, i) => (
            <group key={i} ref={ref} position={[i ? 0.08 : -0.08, 0, 0]}>
              <RBox shadow={false} p={[0, -0.16, 0]} s={[0.12, 0.3, 0.13]} c={outfit.pants} r={0.05} />
              <RBox shadow={false} p={[0, -0.32, 0.025]} s={[0.13, 0.07, 0.19]} c={C.shoe} r={0.03} />
            </group>
          ))}
        </group>
        <RBox shadow={false} p={[0, 0.56, 0]} s={[0.36, 0.42, 0.24]} c={outfit.top} r={0.1} />
        {outfit.accent && <RBox shadow={false} p={[0, 0.48, 0.115]} s={[0.2, 0.1, 0.03]} c={outfit.accent} r={0.015} />}
        {[armL, armR].map((ref, i) => (
          <group key={i} ref={ref} position={[i ? 0.22 : -0.22, 0.72, 0]}>
            <RBox shadow={false} p={[0, -0.15, 0]} s={[0.1, 0.32, 0.11]} c={outfit.top} r={0.045} />
            <RBox shadow={false} p={[0, -0.33, 0]} s={[0.08, 0.07, 0.08]} c={skin} r={0.035} />
          </group>
        ))}
        <RBox shadow={false} p={[0, 1.0, 0]} s={[0.42, 0.4, 0.38]} c={skin} r={0.12} />
        {helmet ? (
          <>
            <RBox shadow={false} p={[0, 1.17, -0.01]} s={[0.48, 0.2, 0.44]} c={helmet} r={0.09} rough={0.35} />
            <RBox shadow={false} p={[0, 1.1, 0.2]} s={[0.4, 0.04, 0.08]} c={helmet} r={0.02} rough={0.35} />
          </>
        ) : (
          <>
            <RBox shadow={false} p={[0, 1.2, -0.02]} s={[0.46, 0.13, 0.42]} c={outfit.hair} r={0.06} />
            <RBox shadow={false} p={[0, 1.04, -0.17]} s={[0.44, 0.3, 0.1]} c={outfit.hair} r={0.05} />
            <RBox shadow={false} p={[0.12, 1.16, 0.17]} s={[0.18, 0.08, 0.06]} c={outfit.hair} r={0.03} rot={[0, 0, -0.25]} />
          </>
        )}
        <RBox shadow={false} p={[-0.09, 1.0, 0.19]} s={[0.05, 0.07, 0.02]} c="#1b1b1b" r={0.02} />
        <RBox shadow={false} p={[0.09, 1.0, 0.19]} s={[0.05, 0.07, 0.02]} c="#1b1b1b" r={0.02} />
        <RBox shadow={false} p={[-0.14, 0.93, 0.185]} s={[0.06, 0.03, 0.01]} c="#f59f8b" r={0.01} />
        <RBox shadow={false} p={[0.14, 0.93, 0.185]} s={[0.06, 0.03, 0.01]} c="#f59f8b" r={0.01} />
      </group>
    </group>
  );
}

/**
 * A step-through scooter, the bike you see everywhere in Vietnam, in the same
 * soft, chunky style as the characters. Local: faces +x, ~1.6 m long.
 */
export function Scooter({ color, night = false }: { color: string; night?: boolean }) {
  const seat = "#2a2a2e";
  const trim = "#d9dde3";
  return (
    <group>
      {/* wheels: tyre + hub */}
      {[-0.55, 0.55].map((x) => (
        <group key={x} position={[x, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.13, 24]} />
            <meshStandardMaterial color="#1c1c1f" roughness={0.85} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.14, 16]} />
            <meshStandardMaterial color={trim} metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      ))}
      {/* step-through floorboard */}
      <RBox shadow={false} p={[0.02, 0.33, 0]} s={[0.56, 0.09, 0.38]} c={seat} r={0.04} />
      {/* rear body over the back wheel */}
      <RBox shadow={false} p={[-0.38, 0.56, 0]} s={[0.78, 0.4, 0.42]} c={color} r={0.17} rough={0.3} />
      {/* rear fender + tail light */}
      <RBox shadow={false} p={[-0.72, 0.5, 0]} s={[0.16, 0.18, 0.3]} c={color} r={0.07} rough={0.3} />
      <RBox shadow={false} p={[-0.8, 0.6, 0]} s={[0.04, 0.07, 0.2]} c="#c81e1e" r={0.02} glow={night ? ["#ff3b3b", 2.2] : undefined} />
      {/* seat */}
      <RBox shadow={false} p={[-0.34, 0.8, 0]} s={[0.66, 0.11, 0.38]} c={seat} r={0.05} rough={0.6} />
      {/* leg shield, rising to the steering head */}
      <RBox shadow={false} p={[0.36, 0.62, 0]} s={[0.18, 0.62, 0.46]} c={color} r={0.08} rot={[0, 0, -0.22]} rough={0.3} />
      <RBox shadow={false} p={[0.56, 0.45, 0]} s={[0.34, 0.08, 0.2]} c={color} r={0.04} rough={0.3} />
      <RBox shadow={false} p={[0.44, 1.0, 0]} s={[0.22, 0.2, 0.5]} c={color} r={0.08} rough={0.3} />
      {/* headlight */}
      <RBox shadow={false} p={[0.56, 1.0, 0]} s={[0.04, 0.1, 0.22]} c="#f6f2e6" r={0.03} glow={night ? ["#fff3d0", 3] : undefined} />
      {/* handlebar, grips, mirrors */}
      <RBox shadow={false} p={[0.4, 1.12, 0]} s={[0.06, 0.05, 0.64]} c="#2c2f36" r={0.02} />
      {[-0.34, 0.34].map((z) => (
        <group key={z}>
          <RBox shadow={false} p={[0.4, 1.12, z]} s={[0.08, 0.07, 0.1]} c="#16161a" r={0.03} />
          <RBox shadow={false} p={[0.38, 1.3, z * 0.85]} s={[0.025, 0.24, 0.025]} c="#2c2f36" r={0.01} />
          <RBox shadow={false} p={[0.38, 1.42, z * 0.85]} s={[0.03, 0.07, 0.11]} c={trim} r={0.02} />
        </group>
      ))}
    </group>
  );
}

/** A scooter with a helmeted rider, as seen in traffic. */
export function Rider({ color, outfit, helmet, night }: { color: string; outfit: Outfit; helmet: string; night: boolean }) {
  return (
    <group>
      <Scooter color={color} night={night} />
      <group position={[-0.22, 0.42, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Chibi outfit={outfit} pose="ride" helmet={helmet} />
      </group>
    </group>
  );
}
