"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { INTERACTABLES, type TargetId } from "../layout";
import { room, useRoom } from "../store";
import { C } from "./materials";

/**
 * Wraps furniture that opens a panel. Clicking it walks the character to the
 * interaction spot and opens the panel on arrival. A floating marker shows
 * it's interactive; the label appears on hover or when the player is close.
 */
export function Interactable({ id, children }: { id: TargetId; children: ReactNode }) {
  const it = INTERACTABLES.find((i) => i.id === id)!;
  const nearby = useRoom((s) => s.nearby === id);
  const [hovered, setHovered] = useState(false);
  const marker = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const lit = hovered || nearby;
  useCursor(hovered);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (marker.current) {
      marker.current.position.y = it.labelAt[1] + Math.sin(t * 2.2 + it.spot[0]) * 0.06;
      marker.current.rotation.y = t * 1.4;
    }
    if (ring.current) {
      const s = lit ? 1 + Math.sin(t * 4) * 0.06 : 0.001;
      ring.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <group
        onClick={(e) => {
          e.stopPropagation();
          room.walkTo(it.spot[0], it.spot[1], id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {children}
      </group>

      <group ref={marker} position={[it.labelAt[0], it.labelAt[1], it.labelAt[2]]}>
        <mesh raycast={() => null}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshBasicMaterial color={C.accent} toneMapped={false} />
        </mesh>
        {lit && (
          <Html center position={[0, 0.3, 0]} style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
            <span className="whitespace-nowrap rounded-full border border-white/10 bg-[#0f1430]/80 px-3 py-1 text-[13px] text-[#f3e6d0] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7),inset_0_-8px_16px_-12px_rgba(255,194,125,0.6)] backdrop-blur-md" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
              {it.label}
            </span>
          </Html>
        )}
      </group>

      {/* ring on the floor where the character will stand */}
      <mesh
        ref={ring}
        position={[it.spot[0], 0.03, it.spot[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
      >
        <ringGeometry args={[0.3, 0.38, 32]} />
        <meshBasicMaterial color={C.accent} transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  );
}
