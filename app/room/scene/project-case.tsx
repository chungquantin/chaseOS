"use client";

import { languageColor, MAX_PROJECTS } from "app/data/projects";
import { FURNITURE } from "../layout";
import type { Mood } from "../store";
import { useProjects } from "../use-projects";
import { C } from "./materials";
import { Box, Glow, RBox } from "./primitives";

const FALLBACK = ["#dea584", "#3178c6", "#f1e05a", "#a855f7", "#22c55e", "#f43f5e", "#0ea5e9", "#f97316", "#64748b"];

/** Lit glass display case; each repo is a product box, coloured by language. */
export function ProjectCase({ mood }: { mood: Mood }) {
  const { x, z, w, d, h } = FURNITURE.projectCase;
  const { projects } = useProjects();
  const shelves = 3;
  const perShelf = Math.ceil(MAX_PROJECTS / shelves);
  const gap = (h - 0.25) / shelves;
  const count = projects.length || MAX_PROJECTS;
  const glow = mood === "night" ? 3 : 1.6;

  return (
    <group position={[x, 0, z]}>
      {/* frame: back, sides, top, plinth (front faces +x) */}
      <RBox p={[-w / 2 + 0.03, h / 2, 0]} s={[0.04, h, d]} c="#2b2a30" r={0.01} />
      <RBox p={[0, h / 2, -d / 2 + 0.03]} s={[w, h, 0.05]} c={C.woodDark} r={0.015} />
      <RBox p={[0, h / 2, d / 2 - 0.03]} s={[w, h, 0.05]} c={C.woodDark} r={0.015} />
      <RBox p={[0, h - 0.03, 0]} s={[w + 0.03, 0.06, d + 0.03]} c={C.woodDark} r={0.015} />
      <RBox p={[0, 0.09, 0]} s={[w, 0.18, d]} c={C.woodDark} r={0.02} />

      {Array.from({ length: shelves }, (_, s) => {
        const y = 0.2 + s * gap;
        return (
          <group key={s}>
            {/* glass shelf + LED strip under the shelf above */}
            <Box p={[0, y, 0]} s={[w - 0.08, 0.015, d - 0.08]} c="#d9f0ff" rough={0.1} />
            <mesh position={[w / 2 - 0.06, y + gap - 0.03, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[d - 0.12, 0.012]} />
              <Glow c="#fff3d6" i={glow} />
            </mesh>
            {/* product boxes */}
            {Array.from({ length: perShelf }, (_, k) => {
              const i = s * perShelf + k;
              if (i >= count) return null;
              const p = projects[i];
              const color = p ? languageColor(p.language) : FALLBACK[i % FALLBACK.length];
              const bh = 0.32 + ((i * 37) % 10) * 0.012;
              return (
                <group key={k} position={[0.02, y + 0.008 + bh / 2, -d / 2 + 0.2 + k * ((d - 0.4) / (perShelf - 1))]} rotation={[0, (k - 1) * 0.12, 0]}>
                  <RBox s={[0.16, bh, 0.24]} c={color} r={0.012} rough={0.5} />
                  <Box p={[0.081, bh * 0.15, 0]} s={[0.002, bh * 0.22, 0.2]} c="#ffffff" shadow={false} />
                </group>
              );
            })}
          </group>
        );
      })}

      {/* glass front */}
      <mesh position={[w / 2 - 0.01, h / 2 + 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d - 0.08, h - 0.3]} />
        <meshPhysicalMaterial color="#e6f6ff" transparent opacity={0.12} roughness={0.04} clearcoat={1} depthWrite={false} />
      </mesh>
      {mood === "night" && <pointLight position={[0.3, h * 0.6, 0]} color="#ffe7c2" intensity={1.4} distance={2.4} decay={1.6} />}
    </group>
  );
}
