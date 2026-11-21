"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { moveWithCollision } from "../collision";
import { INNER, INTERACTABLES, INTERACT_RADIUS } from "../layout";
import { live, room } from "../store";
import { C } from "./materials";
import { RBox } from "./primitives";

const SPEED = 3.2;
const S = Math.SQRT1_2;

/** Screen-relative movement keys mapped onto the iso axes. */
const KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

function usePressedKeys() {
  const pressed = useRef(new Set<string>());
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [role=dialog]")) return;
      if (KEYS[e.code]) {
        pressed.current.add(e.code);
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => pressed.current.delete(e.code);
    const clear = () => pressed.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);
  return pressed;
}

function nearestInteractable(x: number, z: number) {
  let best: (typeof INTERACTABLES)[number] | null = null;
  let bestDist = INTERACT_RADIUS;
  for (const it of INTERACTABLES) {
    const d = Math.hypot(it.spot[0] - x, it.spot[1] - z);
    if (d < bestDist) {
      best = it;
      bestDist = d;
    }
  }
  return best;
}

const lerpAngle = (from: number, to: number, k: number) => {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + d * k;
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Climb timeline (seconds). */
const CLIMB = { turn: 0.35, up: 3.2, hang: 0.9, drop: 0.45 };
const CLIMB_HEIGHT = 1.5;

export function Player() {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const pressed = usePressedKeys();
  const walkPhase = useRef(0);
  const stuckFor = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const state = room.get();
    const p = live.player;
    const g = root.current!;
    const anyKey = pressed.current.size > 0;
    g.visible = !(state.active && INTERACTABLES.find((i) => i.id === state.active)?.closeUp);

    /* ---------------- actions: climbing / gaming ---------------- */
    if (state.action) {
      live.actionTime += dt;
      const t = live.actionTime;
      const k = Math.min(1, dt * 10);

      if (state.action === "climb") {
        g.rotation.y = lerpAngle(g.rotation.y, -Math.PI / 2, k);
        const upT = clamp01((t - CLIMB.turn) / CLIMB.up);
        const dropStart = CLIMB.turn + CLIMB.up + CLIMB.hang;
        const dropT = clamp01((t - dropStart) / CLIMB.drop);
        const y = CLIMB_HEIGHT * smooth(upT) * (1 - dropT * dropT);
        const wallX = INNER + 0.2;
        const lean = clamp01((t - 0.1) / 0.3) * (1 - dropT);
        g.position.set(p.x + (wallX - p.x) * lean, y, p.z);
        // alternate reach: arms up, legs stepping
        const climbing = upT > 0 && upT < 1;
        const ph = t * 6;
        const reach = climbing ? Math.sin(ph) * 0.45 : 0;
        armL.current!.rotation.x = -2.7 + reach;
        armR.current!.rotation.x = -2.7 - reach;
        legL.current!.rotation.x = climbing ? Math.max(0, Math.sin(ph)) * -0.9 : 0;
        legR.current!.rotation.x = climbing ? Math.max(0, -Math.sin(ph)) * -0.9 : 0;
        body.current!.position.y = 0;
        if (t > dropStart + CLIMB.drop + 0.2) {
          g.position.y = 0;
          room.stopAction();
        }
      } else {
        // gaming: sit on the beanbag facing the TV, thumbs busy
        if (anyKey) {
          room.stopAction();
        } else {
          g.rotation.y = lerpAngle(g.rotation.y, Math.PI, k);
          g.position.set(p.x, 0, p.z);
          body.current!.position.y = -0.26 + Math.sin(t * 2) * 0.008;
          legL.current!.rotation.x = -1.35;
          legR.current!.rotation.x = -1.35;
          const thumbs = Math.sin(t * 18) * 0.05;
          armL.current!.rotation.x = -1.0 + thumbs;
          armR.current!.rotation.x = -1.0 - thumbs;
        }
      }
      room.setNearby(nearestInteractable(p.x, p.z)?.id ?? null);
      return;
    }

    /* ---------------- walking ---------------- */
    let dirX = 0;
    let dirZ = 0;
    if (!state.active && state.stage === "room") {
      let ix = 0;
      let iy = 0;
      pressed.current.forEach((code) => {
        ix += KEYS[code][0];
        iy += KEYS[code][1];
      });
      if (ix || iy) {
        if (live.target) room.cancelWalk();
        // screen right = (+x, -z), screen up = (-x, -z)
        dirX = (ix - iy) * S;
        dirZ = (-ix - iy) * S;
        const len = Math.hypot(dirX, dirZ);
        dirX /= len;
        dirZ /= len;
      } else if (live.target) {
        const tx = live.target.x - p.x;
        const tz = live.target.z - p.z;
        const dist = Math.hypot(tx, tz);
        if (dist < SPEED * dt) {
          p.x = live.target.x;
          p.z = live.target.z;
          live.target = null;
          if (state.pending) room.use(state.pending);
          else room.cancelWalk();
        } else {
          dirX = tx / dist;
          dirZ = tz / dist;
        }
      }
    }

    const moving = dirX !== 0 || dirZ !== 0;
    if (moving) {
      const next = moveWithCollision(p.x, p.z, dirX * SPEED * dt, dirZ * SPEED * dt);
      p.x = next.x;
      p.z = next.z;
      stuckFor.current = next.blocked ? stuckFor.current + dt : 0;
      if (live.target && stuckFor.current > 0.2) {
        // can't reach the click target: use it if we're close enough, else stop
        const pending = state.pending;
        const near = nearestInteractable(p.x, p.z);
        room.cancelWalk();
        if (pending && near?.id === pending) room.use(pending);
      }
    }

    room.setNearby(nearestInteractable(p.x, p.z)?.id ?? null);

    g.position.set(p.x, 0, p.z);
    if (moving) {
      g.rotation.y = lerpAngle(g.rotation.y, Math.atan2(dirX, dirZ), Math.min(1, dt * 14));
      walkPhase.current += dt * 11;
    } else {
      walkPhase.current *= 0.85;
    }
    const swing = Math.sin(walkPhase.current) * (moving ? 0.6 : 0);
    legL.current!.rotation.x = swing;
    legR.current!.rotation.x = -swing;
    armL.current!.rotation.x = -swing * 0.8;
    armR.current!.rotation.x = swing * 0.8;
    body.current!.position.y = moving ? Math.abs(Math.sin(walkPhase.current)) * 0.04 : 0;
  });

  return (
    <group ref={root} scale={1.15}>
      {/* soft blob shadow keeps the character grounded */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} raycast={() => null}>
        <circleGeometry args={[0.24, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <group ref={body}>
        {/* legs pivot at the hip */}
        <group position={[0, 0.36, 0]}>
          {[legL, legR].map((ref, i) => (
            <group key={i} ref={ref} position={[i ? 0.08 : -0.08, 0, 0]}>
              <RBox shadow={false} p={[0, -0.16, 0]} s={[0.12, 0.3, 0.13]} c={C.pants} r={0.05} />
              <RBox shadow={false} p={[0, -0.32, 0.025]} s={[0.13, 0.07, 0.19]} c={C.shoe} r={0.03} />
            </group>
          ))}
        </group>
        {/* hoodie */}
        <RBox shadow={false} p={[0, 0.56, 0]} s={[0.36, 0.42, 0.24]} c={C.hoodie} r={0.1} />
        <RBox shadow={false} p={[0, 0.48, 0.115]} s={[0.2, 0.1, 0.03]} c="#e8642f" r={0.015} />
        {[armL, armR].map((ref, i) => (
          <group key={i} ref={ref} position={[i ? 0.22 : -0.22, 0.72, 0]}>
            <RBox shadow={false} p={[0, -0.15, 0]} s={[0.1, 0.32, 0.11]} c={C.hoodie} r={0.045} />
            <RBox shadow={false} p={[0, -0.33, 0]} s={[0.08, 0.07, 0.08]} c={C.skin} r={0.035} />
          </group>
        ))}
        {/* big chibi head */}
        <RBox shadow={false} p={[0, 1.0, 0]} s={[0.42, 0.4, 0.38]} c={C.skin} r={0.12} />
        <RBox shadow={false} p={[0, 1.2, -0.02]} s={[0.46, 0.13, 0.42]} c={C.hair} r={0.06} />
        <RBox shadow={false} p={[0, 1.04, -0.17]} s={[0.44, 0.3, 0.1]} c={C.hair} r={0.05} />
        <RBox shadow={false} p={[0.12, 1.16, 0.17]} s={[0.18, 0.08, 0.06]} c={C.hair} r={0.03} rot={[0, 0, -0.25]} />
        {/* face (+z is forward) */}
        <RBox shadow={false} p={[-0.09, 1.0, 0.19]} s={[0.05, 0.07, 0.02]} c="#1b1b1b" r={0.02} />
        <RBox shadow={false} p={[0.09, 1.0, 0.19]} s={[0.05, 0.07, 0.02]} c="#1b1b1b" r={0.02} />
        <RBox shadow={false} p={[-0.14, 0.93, 0.185]} s={[0.06, 0.03, 0.01]} c="#f59f8b" r={0.01} />
        <RBox shadow={false} p={[0.14, 0.93, 0.185]} s={[0.06, 0.03, 0.01]} c="#f59f8b" r={0.01} />
        {/* eye sparkles + smile */}
        <RBox shadow={false} p={[-0.1, 1.022, 0.2]} s={[0.02, 0.025, 0.01]} c="#ffffff" r={0.008} />
        <RBox shadow={false} p={[0.08, 1.022, 0.2]} s={[0.02, 0.025, 0.01]} c="#ffffff" r={0.008} />
        <mesh position={[0, 0.935, 0.192]} rotation={[0, 0, Math.PI]} scale={[1.2, 0.8, 1]}>
          <torusGeometry args={[0.04, 0.007, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#7a4332" roughness={0.5} />
        </mesh>
        <Glasses />
      </group>
    </group>
  );
}

/** Thin round glasses, sized to the chibi head (eyes at y 1.0, face at +z). */
function Glasses() {
  return (
    <group>
      {[-0.09, 0.09].map((x) => (
        <group key={x} position={[x, 1.0, 0.198]} scale={[1.12, 1, 1]}>
          <mesh>
            <torusGeometry args={[0.066, 0.007, 12, 40]} />
            <meshStandardMaterial color="#14141a" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, -0.001]}>
            <circleGeometry args={[0.066, 32]} />
            <meshStandardMaterial color="#cfe6ff" transparent opacity={0.14} roughness={0.05} depthWrite={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.015, 0.198]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, 0.05, 8]} />
        <meshStandardMaterial color="#14141a" roughness={0.3} metalness={0.5} />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 1.02, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.2, 8]} />
          <meshStandardMaterial color="#14141a" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
