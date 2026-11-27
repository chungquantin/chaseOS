"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { CanvasTexture, type Group } from "three";
import { BUILT_APPS, type BuiltApp } from "app/data/apps";
import { chapters, type Chapter } from "app/data/career";
import { APP_STATUES, JOB_CENTER, JOB_STATUES, REPO_WALL, snapToWalkable } from "../world";
import { BUILDINGS, DOOR_W, type Building, type BuildingId } from "../streetmap";
import { live, room, type Mood } from "../store";
import { Interactable } from "./interactable";
import { canvasTexture } from "./materials";
import { Box, Cyl, RBox } from "./primitives";
import { JobSymbol } from "./symbols";

/**
 * The two walk-in buildings on the street. Like the room they're cutaway
 * dioramas: full walls at the back, knee-high walls on the sides facing the
 * camera, and a doorway in the front wall you simply walk through. Inside,
 * every job and every app is a statue you can walk up to.
 */

const H = 3.4; // inside height of the back wall
const H_BACK = 6.4; // the back wall keeps going up, like the neighbouring houses
const LOW = 0.95; // knee-high walls on the near sides
const WT = 0.3;
const P = BUILDINGS.projects;

type Theme = { wall: string; trim: string; floor: string; accent: string; lamp: string; sign: string; signFg: string; title: string; sub: string };
const THEME: Record<BuildingId, Theme> = {
  jobs: { wall: "#ecd9bd", trim: "#7a4f33", floor: "#b98a5e", accent: "#ff9d4d", lamp: "#ffbf73", sign: "#2a1d16", signFg: "#ffd9a0", title: "PAST JOBS", sub: "where I've worked" },
  projects: { wall: "#dfe7f0", trim: "#31456b", floor: "#d9d1c2", accent: "#4f8cff", lamp: "#cfe3ff", sign: "#14213d", signFg: "#dff1ff", title: "PROJECTS", sub: "things I've built" },
};

function useSign(t: Theme) {
  return useMemo(
    () =>
      canvasTexture(512, 160, (g) => {
        g.fillStyle = t.sign;
        g.fillRect(0, 0, 512, 160);
        g.strokeStyle = t.signFg;
        g.globalAlpha = 0.5;
        g.lineWidth = 4;
        g.strokeRect(10, 10, 492, 140);
        g.globalAlpha = 1;
        g.fillStyle = t.signFg;
        g.textAlign = "center";
        g.font = "700 74px Georgia, serif";
        g.fillText(t.title, 256, 92);
        g.font = "italic 28px Georgia, serif";
        g.globalAlpha = 0.75;
        g.fillText(t.sub, 256, 134);
      }),
    [t]
  );
}

/** Walls, floor, doorway and sign of one building. */
function Shell({ id, night }: { id: BuildingId; night: boolean }) {
  const b: Building = BUILDINGS[id];
  const t = THEME[id];
  const sign = useSign(t);
  const W = b.x1 - b.x0;
  const D = b.z1 - b.z0;
  const frontZ = b.z1 - 0.15;
  const half = (W - DOOR_W) / 2;
  const leftFull = id === "projects"; // the far-left wall; between the two buildings it's a low wall
  const cap = "#f4ece0";
  return (
    <group>
      {/* floor slab: click to walk */}
      <mesh
        position={[b.cx, -0.2, b.cz]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          const [x, z] = snapToWalkable(e.point.x, e.point.z);
          room.walkTo(x, z);
        }}
      >
        <boxGeometry args={[W, 0.4, D]} />
        <meshStandardMaterial color={t.floor} roughness={0.7} />
      </mesh>
      {Array.from({ length: Math.floor(W / 1.5) }, (_, i) => (
        <Box key={i} p={[b.x0 + 0.75 + i * 1.5, 0.005, b.cz]} s={[0.025, 0.01, D - 0.4]} c={t.trim} shadow={false} />
      ))}

      {/* back wall (full height, with windows) */}
      <Box p={[b.cx, H_BACK / 2, b.z0 + WT / 2]} s={[W, H_BACK, WT]} c={t.wall} mat="plaster" />
      <Box p={[b.cx, 0.55, b.z0 + WT + 0.02]} s={[W - WT, 1.1, 0.05]} c={t.trim} shadow={false} />
      <Box p={[b.cx, H - 0.08, b.z0 + WT + 0.04]} s={[W - WT, 0.16, 0.09]} c={t.trim} shadow={false} />
      {Array.from({ length: Math.floor(W / 3.2) }, (_, i) => {
        const x = b.cx + (i - (Math.floor(W / 3.2) - 1) / 2) * 3.2;
        return (
          <group key={i}>
            <Box p={[x, 2.1, b.z0 + WT + 0.03]} s={[1.0, 1.7, 0.05]} c={t.trim} shadow={false} />
            <mesh position={[x, 2.1, b.z0 + WT + 0.065]}>
              <planeGeometry args={[0.8, 1.5]} />
              <meshBasicMaterial color={t.lamp} toneMapped={false} />
            </mesh>
            {/* the floor above */}
            <mesh position={[x, 5.0, b.z0 + WT + 0.03]}>
              <planeGeometry args={[1.0, 1.6]} />
              <meshBasicMaterial color={night && i % 2 ? "#b8915f" : night ? "#1b2238" : "#7d9bb8"} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* left wall: full for the far building, knee-high between the two */}
      {leftFull ? (
        <>
          <Box p={[b.x0 + WT / 2, H_BACK / 2, b.cz]} s={[WT, H_BACK, D]} c={t.wall} mat="plaster" />
          <Box p={[b.x0 + WT + 0.02, 0.55, b.cz]} s={[0.05, 1.1, D - WT]} c={t.trim} shadow={false} />
        </>
      ) : (
        <>
          <Box p={[b.x0, LOW / 2, b.cz]} s={[WT * 0.8, LOW, D]} c={t.wall} mat="plaster" shadow={false} />
          <Box p={[b.x0, LOW + 0.03, b.cz]} s={[WT, 0.06, D + 0.04]} c={cap} shadow={false} />
        </>
      )}
      {/* right wall: knee-high (the jobs one is the shared wall; projects' is that one) */}
      {id === "jobs" && (
        <>
          <Box p={[b.x1, LOW / 2, b.cz]} s={[WT * 0.8, LOW, D]} c={t.wall} mat="plaster" shadow={false} />
          <Box p={[b.x1, LOW + 0.03, b.cz]} s={[WT, 0.06, D + 0.04]} c={cap} shadow={false} />
        </>
      )}

      {/* front wall: knee-high, with the doorway in the middle */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box p={[b.cx + s * (DOOR_W / 2 + half / 2), LOW / 2, frontZ]} s={[half, LOW, WT * 0.8]} c={t.wall} mat="plaster" shadow={false} />
          <Box p={[b.cx + s * (DOOR_W / 2 + half / 2), LOW + 0.03, frontZ]} s={[half + 0.04, 0.06, WT]} c={cap} shadow={false} />
        </group>
      ))}
      {/* door frame, awning and sign */}
      {[-1, 1].map((s) => (
        <Box key={s} p={[b.cx + s * (DOOR_W / 2 + 0.1), 1.6, frontZ]} s={[0.2, 3.2, 0.3]} c={t.trim} shadow={false} />
      ))}
      <Box p={[b.cx, 3.25, frontZ]} s={[DOOR_W + 0.6, 0.22, 0.34]} c={t.trim} shadow={false} />
      <mesh position={[b.cx, 3.95, frontZ + 0.1]}>
        <boxGeometry args={[5.0, 0.95, 0.14]} />
        <meshBasicMaterial attach="material-4" map={sign} toneMapped={false} color={night ? "#e0e0e0" : "#ffffff"} />
        {[0, 1, 2, 3, 5].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color="#222" />
        ))}
      </mesh>
      {[-2.1, 2.1].map((x) => (
        <Box key={x} p={[b.cx + x, 3.45, frontZ + 0.1]} s={[0.1, 0.5, 0.1]} c="#222" shadow={false} />
      ))}
      <mesh position={[b.cx, 3.1, frontZ + 0.45]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[DOOR_W + 1.2, 0.05, 1.0]} />
        <meshStandardMaterial color={t.accent} roughness={0.7} />
      </mesh>
      {/* welcome mat in the doorway */}
      <RBox p={[b.cx, 0.04, frontZ + 0.1]} s={[DOOR_W - 0.3, 0.05, 0.8]} c={t.accent} r={0.02} glow={[t.accent, 0.8]} shadow={false} />
      {/* light spilling out of the doorway at night */}
      <pointLight position={[b.cx, 2.2, b.z1 + 1.2]} color={t.lamp} intensity={night ? 8 : 0} distance={6} decay={2} />
      {/* the room's own light */}
      <pointLight position={[b.cx, 3.0, b.cz]} color={t.lamp} intensity={night ? 26 : 16} distance={13} decay={2} />
    </group>
  );
}

/** Shows its children only while the character is within `r` of a point (keeps the street uncluttered). */
function Near({ at, r = 4.5, children }: { at: [number, number]; r?: number; children: ReactNode }) {
  const [on, setOn] = useState(false);
  const was = useRef(false);
  useFrame(() => {
    const now = Math.hypot(live.player.x - at[0], live.player.z - at[1]) < r;
    if (now !== was.current) {
      was.current = now;
      setOn(now);
    }
  });
  return on ? <>{children}</> : null;
}

function Placard({ at, y, title, sub, chip, color }: { at: [number, number]; y: number; title: string; sub?: string; chip?: string; color: string }) {
  return (
    <Html center position={[at[0], y, at[1]]} style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
      <div className="whitespace-nowrap rounded-lg border border-white/10 bg-[#0f1430]/80 px-2.5 py-1 text-center text-[#f3e6d0] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-display text-[13px] leading-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            {title}
          </span>
          {chip && (
            <span className="flex items-center gap-1 rounded-full px-1.5 py-px text-[9.5px] font-medium uppercase tracking-wide" style={{ background: `${color}33`, color }}>
              <span className="size-1.5 rounded-full" style={{ background: color }} />
              {chip}
            </span>
          )}
        </div>
        {sub && <div className="text-[10.5px] leading-tight opacity-70">{sub}</div>}
      </div>
    </Html>
  );
}

function appTile(app: BuiltApp) {
  const tex = canvasTexture(256, 256, (g) => {
    g.fillStyle = app.color;
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = "rgba(255,255,255,0.95)";
    g.font = "700 140px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(app.name.slice(0, 1), 128, 138);
  }) as CanvasTexture & { ctx: CanvasRenderingContext2D };
  if (app.icon) {
    const img = new Image();
    img.onload = () => {
      const g = tex.ctx;
      g.fillStyle = app.color;
      g.fillRect(0, 0, 256, 256);
      g.drawImage(img, 28, 28, 200, 200);
      tex.needsUpdate = true;
    };
    img.src = app.icon;
  }
  return tex;
}

function AppStatue({ app, at }: { app: BuiltApp; at: [number, number] }) {
  const tile = useRef<Group>(null);
  const tex = useMemo(() => appTile(app), [app]);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + at[0];
    if (tile.current) {
      tile.current.rotation.y = Math.sin(t * 0.7) * 0.5;
      tile.current.position.y = 1.35 + Math.sin(t * 1.6) * 0.05;
    }
  });
  const status = app.status ?? "Shipped";
  return (
    <Interactable id={`app:${app.id}`}>
      <group position={[at[0], 0, at[1]]}>
        <Cyl p={[0, 0.3, 0]} args={[0.52, 0.58, 0.6, 28]} c="#2a2d36" />
        <Cyl p={[0, 0.62, 0]} args={[0.46, 0.46, 0.04, 28]} c={app.color} glow={[app.color, 1.4]} />
        <group ref={tile} position={[0, 1.35, 0]}>
          <RBox s={[0.78, 0.78, 0.12]} c={app.color} r={0.12} rough={0.35} shadow={false} />
          <mesh position={[0, 0, 0.065]}>
            <planeGeometry args={[0.66, 0.66]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <Near at={at}>
        <Placard at={at} y={0.9} title={app.name} sub={app.kind} chip={status} color={status === "Live" ? "#4ade80" : "#fbbf24"} />
      </Near>
    </Interactable>
  );
}

/** The open-source wall: a board of repo tiles on the left wall. */
function RepoWall() {
  const tiles = useMemo(
    () =>
      Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => ({ r, c, color: ["#f1e05a", "#3178c6", "#dea584", "#e34c26", "#3572a5", "#89e051"][(r * 3 + c * 5) % 6] }))
      ).flat(),
    []
  );
  const x = P.x0 + WT + 0.1;
  return (
    <Interactable id="repos">
      <group position={[x, 0, REPO_WALL.z]} rotation={[0, Math.PI / 2, 0]}>
        <RBox p={[0, 1.6, 0]} s={[3.2, 1.9, 0.1]} c="#1b2236" r={0.04} />
        {tiles.map((t) => (
          <RBox key={`${t.r}${t.c}`} p={[-1.25 + t.c * 0.5, 2.2 - t.r * 0.42, 0.06]} s={[0.42, 0.34, 0.04]} c={t.color} r={0.02} rough={0.5} glow={[t.color, 0.35]} shadow={false} />
        ))}
        <Box p={[0, 0.95, 0.06]} s={[3.0, 0.012, 0.02]} c="#ffffff" shadow={false} />
      </group>
      <Near at={[x + 0.7, REPO_WALL.z]}>
        <Placard at={[x + 0.7, REPO_WALL.z]} y={0.7} title="Open source" sub="every repo on GitHub" color="#cfe3ff" />
      </Near>
    </Interactable>
  );
}

function JobStatue({ ch, at, now }: { ch: Chapter; at: [number, number]; now: boolean }) {
  const scale = now ? 1.5 : 1;
  const ph = now ? 0.62 : 0.5;
  return (
    <Interactable id={`job:${ch.id}`}>
      <group position={[at[0], 0, at[1]]}>
        {now && <Cyl p={[0, 0.06, 0]} args={[1.15, 1.2, 0.12, 40]} c="#3a2a1e" />}
        {now && <Cyl p={[0, 0.13, 0]} args={[1.0, 1.0, 0.03, 40]} c={ch.org.brand} glow={[ch.org.brand, 0.9]} />}
        <Cyl p={[0, ph / 2 + (now ? 0.12 : 0), 0]} args={[now ? 0.62 : 0.52, now ? 0.7 : 0.58, ph, 28]} c="#2a2d36" />
        <Cyl p={[0, ph + (now ? 0.14 : 0.02), 0]} args={[now ? 0.58 : 0.48, now ? 0.58 : 0.48, 0.04, 28]} c={ch.org.brand} glow={[ch.org.brand, 1.2]} />
        <group position={[0, ph + (now ? 0.16 : 0.04), 0]} scale={scale}>
          <JobSymbol id={ch.id} brand={ch.org.brand} />
        </group>
      </group>
      <Near at={at} r={now ? 5.5 : 4.5}>
        <Placard
          at={at}
          y={now ? 0.55 : 0.82}
          title={ch.company}
          sub={ch.period}
          chip={now ? "Now" : undefined}
          color="#ffb86b"
        />
      </Near>
    </Interactable>
  );
}


function ProjectsHall({ night }: { night: boolean }) {
  return (
    <>
      <Shell id="projects" night={night} />
      <RepoWall />
      {APP_STATUES.map((s) => {
        const app = BUILT_APPS.find((a) => a.id === s.id)!;
        return <AppStatue key={s.id} app={app} at={s.at} />;
      })}
    </>
  );
}

function JobsHall({ night }: { night: boolean }) {
  return (
    <>
      <Shell id="jobs" night={night} />
      {/* a rug under the centre piece */}
      <Cyl p={[JOB_CENTER[0], 0.015, JOB_CENTER[1]]} args={[2.5, 2.5, 0.03, 48]} c="#7a2f2a" shadow={false} />
      <Cyl p={[JOB_CENTER[0], 0.032, JOB_CENTER[1]]} args={[2.2, 2.2, 0.01, 48]} c="#e6c58a" shadow={false} />
      {JOB_STATUES.map((s, i) => {
        const ch = chapters.find((c) => c.id === s.id)!;
        return <JobStatue key={s.id} ch={ch} at={s.at} now={i === 0} />;
      })}
    </>
  );
}

export function Buildings({ mood }: { mood: Mood }) {
  const night = mood === "night";
  return (
    <group>
      <JobsHall night={night} />
      <ProjectsHall night={night} />
    </group>
  );
}
