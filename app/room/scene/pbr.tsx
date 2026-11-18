"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useTexture } from "@react-three/drei";
import { RepeatWrapping, SRGBColorSpace, type Texture } from "three";
import { TEXTURE_FILES } from "./texture-files";

/**
 * Real PBR textures (CC0, Poly Haven, 512 px) shared by the whole scene: oak
 * flooring, walnut grain, plaster and velvet. Materials pick them up by what
 * an object is made of (see primitives.tsx), so furniture gets grain,
 * fabrics get weave and walls get a hand-plastered surface without each
 * object wiring textures itself.
 */

const FILES = TEXTURE_FILES;

type Key = keyof typeof FILES;
type Textures = Record<Key, Texture> & {
  /** a copy of a texture with its own tiling */
  tiled: (key: Key, repeat: number) => Texture;
};

const Ctx = createContext<Textures | null>(null);

export function PBRProvider({ children }: { children: ReactNode }) {
  const raw = useTexture(FILES as unknown as Record<Key, string>) as unknown as Record<Key, Texture>;
  const value = useMemo(() => {
    for (const [k, t] of Object.entries(raw) as [Key, Texture][]) {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.anisotropy = 8;
      if (k.endsWith("Map")) t.colorSpace = SRGBColorSpace;
      t.needsUpdate = true;
    }
    const cache = new Map<string, Texture>();
    const tiled = (key: Key, repeat: number) => {
      const id = `${key}@${repeat}`;
      let t = cache.get(id);
      if (!t) {
        t = raw[key].clone();
        t.repeat.set(repeat, repeat);
        t.needsUpdate = true;
        cache.set(id, t);
      }
      return t;
    };
    return { ...raw, tiled };
  }, [raw]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePBR = () => useContext(Ctx);

/** Make sure the files are in the HTTP cache before the scene mounts. */
export function preloadPBR() {
  useTexture.preload(Object.values(FILES));
}
