"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Mesh } from "three";
import { INTERACTABLES } from "../layout";
import { live, room, useRoom } from "../store";
import { C } from "./materials";
import { Bookshelf, Chair, CoffeeTable, Desk, FloorLamp, Plant, Sideboard, Sofa } from "./furniture";
import { ClimbingWall, GameCorner } from "./interests";
import { ProjectCase } from "./project-case";
import { Floor, Walls, Window } from "./shell";
import { Street } from "./street";
import { Effects, Lighting } from "./lighting";
import { Interactable } from "./interactable";
import { Player } from "./player";
import { PBRProvider, preloadPBR } from "./pbr";

preloadPBR();

const ISO_OFFSET = new Vector3(12, 11, 12);
const UP = new Vector3(0, 1, 0);

/** Tell the overlay the room has actually drawn (ends the loading screen). */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (++frames.current === 4) room.setReady();
  });
  return null;
}

/** Orthographic iso camera that fits the room and gently follows the player. */
function CameraRig() {
  const { camera, size } = useThree();
  const focus = useRef(new Vector3(0, 1.2, 0));
  const want = useRef(new Vector3());
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const baseZoom = useRef(50);
  useEffect(() => {
    // Room is ~15 units wide and ~12 tall on screen at this angle. On
    // portrait screens, crop the sides and lean on the follow cam instead.
    const portrait = size.width < size.height;
    baseZoom.current = portrait
      ? Math.min(size.width / 15, size.height / 20)
      : Math.min(size.width / 26, size.height / 19);
  }, [size]);

  const angle = useRef(0.55);
  const offset = useRef(new Vector3());

  useFrame(({ clock }) => {
    // intro: wide, slowly swaying establishing shot; room: follow / close-ups
    const { active, stage } = room.get();
    const intro = stage !== "room";
    const closeUp = active ? INTERACTABLES.find((i) => i.id === active)?.closeUp : undefined;
    let zoom = baseZoom.current;
    const wantAngle = intro && !reduceMotion.current ? 0.32 + Math.sin(clock.elapsedTime * 0.35) * 0.12 : 0;
    if (intro) {
      want.current.set(0, 0.9, 0);
      zoom = baseZoom.current * 0.68;
    } else if (closeUp) {
      want.current.set(...closeUp.at);
      zoom = Math.min(size.width / closeUp.extent, size.height / (closeUp.extent * 0.75));
    } else {
      // the closer the visitor zooms in, the tighter we follow the character
      zoom *= live.zoom;
      const base = size.width < size.height ? 0.6 : 0.25;
      const zoomedIn = Math.min(1, Math.max(0, (live.zoom - 1) / 1.2));
      const follow = base + (1 - base) * zoomedIn;
      want.current.set(live.player.x * follow, 1.2 - 0.4 * zoomedIn, live.player.z * follow);
    }
    const k = reduceMotion.current ? 1 : intro ? 0.03 : 0.07;
    focus.current.lerp(want.current, k);
    angle.current += (wantAngle - angle.current) * (reduceMotion.current ? 1 : 0.04);
    if (Math.abs(camera.zoom - zoom) > 0.01) {
      camera.zoom += (zoom - camera.zoom) * k;
      camera.updateProjectionMatrix();
    }
    offset.current.copy(ISO_OFFSET).applyAxisAngle(UP, angle.current);
    camera.position.copy(focus.current).add(offset.current);
    camera.lookAt(focus.current);
  });

  return null;
}

/** Wheel / trackpad pinch / two-finger pinch zoom on the canvas. */
function ZoomInput() {
  const el = useThree((s) => s.gl.domElement);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (room.get().stage !== "room" || room.get().active) return;
      e.preventDefault();
      // trackpad pinch arrives as ctrl+wheel with small deltas
      const k = e.ctrlKey ? 0.01 : 0.0015;
      room.zoomBy(Math.exp(-e.deltaY * k));
    };
    const touches = new Map<number, { x: number; y: number }>();
    let lastDist = 0;
    const dist = () => {
      const [a, b] = Array.from(touches.values());
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) lastDist = dist();
    };
    const move = (e: PointerEvent) => {
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2 && lastDist > 0) {
        const d = dist();
        room.zoomBy(d / lastDist);
        lastDist = d;
      }
    };
    const up = (e: PointerEvent) => {
      touches.delete(e.pointerId);
      if (touches.size < 2) lastDist = 0;
    };
    el.style.touchAction = "none";
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [el]);
  return null;
}

/** Small marker at the click-to-move destination. */
function TargetMarker() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current!;
    m.visible = live.target !== null;
    if (live.target) {
      m.position.set(live.target.x, 0.03, live.target.z);
      m.scale.setScalar(0.85 + Math.sin(clock.elapsedTime * 6) * 0.1);
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <ringGeometry args={[0.12, 0.17, 24]} />
      <meshBasicMaterial color={C.accent} transparent opacity={0.9} toneMapped={false} />
    </mesh>
  );
}

type Quality = "high" | "low";

/**
 * Quality is decided once, from the device, and never changes mid-visit:
 * switching paths at runtime made the room visibly drop in quality when a
 * zoom-out briefly lowered the frame rate.
 */
function useInitialQuality(): Quality {
  const [q, setQ] = useState<Quality>("high");
  useEffect(() => {
    const small = window.matchMedia("(max-width: 720px)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (small || coarse) setQ("low");
  }, []);
  return q;
}

/**
 * Almost nothing that casts a shadow moves (the character uses a blob
 * shadow), so the shadow map is rendered on demand instead of every frame:
 * for the first couple of seconds (async content settling), on mood change,
 * and every few seconds as a cheap safety net.
 */
function ShadowCache({ mood }: { mood: string }) {
  const gl = useThree((s) => s.gl);
  const since = useRef(0);
  const age = useRef(0);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    age.current = 0;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl, mood]);
  useFrame((_, dt) => {
    age.current += dt;
    since.current += dt;
    if (age.current < 2 || since.current > 4) {
      gl.shadowMap.needsUpdate = true;
      since.current = 0;
    }
  });
  return null;
}

export default function Scene() {
  const mood = useRoom((s) => s.mood);
  const initial = useInitialQuality();
  const quality: Quality = initial;
  return (
    <Canvas
      orthographic
      shadows="percentage"
      dpr={quality === "high" ? [1, 1.5] : 1}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ position: [12, 11, 12], zoom: 50, near: 0.1, far: 100 }}
      fallback={
        <p className="p-6 text-[#efe5d6]">
          Your browser can’t render the 3D room. Use the menu to open past jobs,
          projects and writing.
        </p>
      }
    >
      <ShadowCache mood={mood} />
      <CameraRig />
      <ZoomInput />
      <Lighting mood={mood} />
      <fog attach="fog" args={[mood === "night" ? "#0a0f22" : "#c99579", 30, 62]} />

      {/* everything textured waits for the PBR maps; the loading screen covers it */}
      <Suspense fallback={null}>
      <PBRProvider>
      <ReadySignal />
      <Street mood={mood} />
      <Floor quality={quality} />
      <Walls />
      <Window mood={mood} />

      <Chair />
      <Sofa />
      <Plant />
      <Sideboard />
      <FloorLamp mood={mood} />

      <Interactable id="jobs">
        <CoffeeTable />
      </Interactable>
      <Interactable id="writing">
        <Bookshelf />
      </Interactable>
      <Interactable id="projects">
        <ProjectCase mood={mood} />
      </Interactable>
      <Interactable id="desk">
        <Desk />
      </Interactable>
      <Interactable id="climb">
        <ClimbingWall />
      </Interactable>
      <Interactable id="game">
        <GameCorner mood={mood} />
      </Interactable>

      <TargetMarker />
      <Player />
      </PBRProvider>
      </Suspense>

      <Effects mood={mood} quality={quality} />
    </Canvas>
  );
}
