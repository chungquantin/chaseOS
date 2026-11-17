"use client";

import { CanvasTexture, Color, SRGBColorSpace } from "three";

/** Shared palette. Lighting (day/night) changes the mood; these stay put. */
export const C = {
  wall: "#f2dfc8",
  wallCap: "#fbf5ec",
  slab: "#f1e7da",
  wainscot: "#c98e60",
  wainscotDark: "#a8714a",
  woodDark: "#6b4630",
  woodMid: "#a8714a",
  woodLight: "#c98d5a",
  black: "#2b2a2e",
  charcoal: "#3a3a40",
  metal: "#8d8f96",
  brass: "#d2a542",
  paper: "#fbf8f1",
  rug: "#4fa898",
  sofa: "#e7d8c1",
  cushion: "#f6eee1",
  curtain: "#9ec39c",
  pot: "#c9744a",
  leaf: "#3f7a45",
  leafLight: "#5f9c55",
  lampShade: "#f7e1b5",
  accent: "#ff7a45",
  pink: "#e6007a",
  cyan: "#3fd8ff",
  violet: "#8b5cf6",
  green: "#22c55e",
  red: "#ef4444",
  beige: "#e4d7bd",
  skin: "#f2c9a0",
  hair: "#2a1d16",
  hoodie: "#1d1d22",
  pants: "#34435e",
  shoe: "#f4f1ea",
};

/** HDR colour for emissive/bloom: values above 1 glow. */
export const hdr = (c: string, intensity: number) => new Color(c).multiplyScalar(intensity);

export function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return Object.assign(tex, { ctx });
}

const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/* ------------------------------------------------------------ textures */

export function makeCodeTexture() {
  return canvasTexture(320, 512, (ctx) => {
    ctx.fillStyle = "#11131a";
    ctx.fillRect(0, 0, 320, 512);
    const palette = ["#c792ea", "#82aaff", "#c3e88d", "#f78c6c", "#89ddff"];
    const rand = rng(3);
    for (let line = 0; line < 30; line++) {
      const y = 16 + line * 16;
      ctx.fillStyle = "#3b4052";
      ctx.fillRect(8, y, 12, 5);
      let x = 28 + (line % 6 === 0 ? 0 : 18 * Math.floor(rand() * 3));
      const tokens = 1 + Math.floor(rand() * 3);
      for (let t = 0; t < tokens; t++) {
        const w = 18 + rand() * 60;
        ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
        ctx.fillRect(x, y, w, 5);
        x += w + 7;
      }
    }
  });
}

/** Sky seen through the window. */
export function makeSkyTexture(mood: "day" | "night") {
  return canvasTexture(256, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    if (mood === "day") {
      g.addColorStop(0, "#ffd9a8");
      g.addColorStop(1, "#ffb37a");
    } else {
      g.addColorStop(0, "#1a1d3f");
      g.addColorStop(1, "#3b2d5c");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const rand = rng(5);
    if (mood === "night") {
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 40; i++) ctx.fillRect(rand() * 256, rand() * 160, 2, 2);
      ctx.fillStyle = "#f6edd2";
      ctx.beginPath();
      ctx.arc(70, 70, 22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      [
        [60, 60, 28],
        [90, 55, 22],
        [180, 100, 20],
        [205, 96, 16],
      ].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    // distant city silhouette
    ctx.fillStyle = mood === "day" ? "rgba(160,90,70,0.45)" : "rgba(10,10,30,0.8)";
    let x = 0;
    while (x < 256) {
      const w = 18 + rand() * 26;
      const h = 30 + rand() * 60;
      ctx.fillRect(x, 256 - h, w - 3, h);
      x += w;
    }
  });
}

/** One job document lying on the table. */
export function makeJobPaperTexture(title: string, subtitle: string, period: string, accent: string) {
  return canvasTexture(300, 390, (ctx) => {
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, 300, 390);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 300, 16);
    ctx.fillStyle = "#1c1c1c";
    ctx.font = "bold 36px Georgia, serif";
    // shrink long names to fit
    let size = 36;
    while (ctx.measureText(title).width > 260 && size > 18) {
      size -= 2;
      ctx.font = `bold ${size}px Georgia, serif`;
    }
    ctx.fillText(title, 20, 70);
    ctx.font = "italic 17px Georgia, serif";
    ctx.fillStyle = "#57534e";
    ctx.fillText(subtitle.length > 30 ? subtitle.slice(0, 29) + "…" : subtitle, 20, 100);
    ctx.font = "15px ui-monospace, Menlo, monospace";
    ctx.fillStyle = accent;
    ctx.fillText(period, 20, 128);
    ctx.fillStyle = "#d6d1c6";
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(20, 156 + i * 20, i % 4 === 3 ? 140 : 230 + ((i * 29) % 30), 7);
    }
  });
}

/** Original pixel-art poster for the game corner. */
export function makePixelPoster() {
  return canvasTexture(160, 220, (ctx) => {
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(0, 0, 160, 220);
    const px = (x: number, y: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x * 10, y * 10, 10, 10);
    };
    // pixel heart
    const heart = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
    heart.forEach((row, y) =>
      row.split("").forEach((v, x) => v === "1" && px(x + 4, y + 4, "#f43f5e"))
    );
    // pixel mountains
    for (let x = 0; x < 16; x++) {
      const h = 3 + Math.round(2 + 2 * Math.sin(x * 0.9));
      for (let y = 0; y < h; y++) px(x, 21 - y, y === h - 1 ? "#e2e8f0" : "#334155");
    }
    ctx.fillStyle = "#fde047";
    ctx.font = "bold 26px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("GG", 80, 140);
  });
}

/**
 * TV screen: standby card, or a tiny original runner game while playing.
 * Call draw(t, playing) every frame you want it updated.
 */
export function makeTvTexture() {
  const W = 320;
  const H = 180;
  const tex = canvasTexture(W, H, () => {});
  const draw = (t: number, playing: boolean) => {
    const ctx = tex.ctx;
    if (!playing) {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#111827");
      g.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#a5b4fc";
      ctx.font = "bold 22px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("PRESS  E  TO  PLAY", W / 2, H / 2 + 8);
      ctx.textAlign = "left";
    } else {
      ctx.fillStyle = "#0ea5e9";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, 0, W, 60);
      // clouds
      ctx.fillStyle = "#f0f9ff";
      for (let i = 0; i < 3; i++) {
        const cx = (((i * 140 - t * 20) % (W + 80)) + W + 80) % (W + 80) - 40;
        ctx.fillRect(cx, 24 + i * 12, 40, 10);
        ctx.fillRect(cx + 8, 16 + i * 12, 24, 10);
      }
      // ground
      const groundY = 140;
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(0, groundY, W, 8);
      ctx.fillStyle = "#854d0e";
      ctx.fillRect(0, groundY + 8, W, H - groundY);
      // obstacles scroll left; runner jumps over them
      const speed = 110;
      const gap = 150;
      const off = (t * speed) % gap;
      const runnerX = 60;
      let ry = groundY - 24;
      ctx.fillStyle = "#f97316";
      for (let x = W - off; x > -20; x -= gap) {
        ctx.fillRect(x, groundY - 22, 14, 22);
        // jump arc while an obstacle passes under the runner
        const d = x - runnerX;
        if (d > -18 && d < 46) ry = groundY - 24 - Math.sin(((46 - d) / 64) * Math.PI) * 46;
      }
      ctx.fillStyle = "#ff7a45";
      ctx.fillRect(runnerX, ry, 18, 24);
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(runnerX + 11, ry + 6, 4, 4);
      // score
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px ui-monospace, Menlo, monospace";
      ctx.fillText(`SCORE ${String(Math.floor(t * 10)).padStart(5, "0")}`, 12, 22);
    }
    tex.needsUpdate = true;
  };
  draw(0, false);
  return Object.assign(tex, { draw });
}
