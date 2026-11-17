"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { useKlines, type Candle } from "../use-klines";

const H = 320;

function draw(
  ctx: CanvasRenderingContext2D,
  W: number,
  candles: Candle[],
  status: string
) {
  ctx.fillStyle = "#0b0f14";
  ctx.fillRect(0, 0, W, H);

  ctx.font = "600 20px ui-monospace, Menlo, monospace";
  ctx.fillStyle = "#8b98a9";
  ctx.fillText("BTC/USDT · 15m · live", 20, 34);

  const dot = status === "live" ? "#22c55e" : status === "error" ? "#ef4444" : "#eab308";
  ctx.fillStyle = dot;
  ctx.beginPath();
  ctx.arc(W - 24, 28, 6, 0, Math.PI * 2);
  ctx.fill();

  if (candles.length < 2) {
    ctx.fillStyle = "#56616f";
    ctx.font = "18px ui-monospace, Menlo, monospace";
    ctx.fillText(status === "error" ? "feed offline" : "connecting…", 20, H / 2);
    return;
  }

  const first = candles[0].open;
  const last = candles[candles.length - 1].close;
  const up = last >= first;
  const pct = ((last - first) / first) * 100;

  ctx.font = "700 40px ui-monospace, Menlo, monospace";
  ctx.fillStyle = "#e6edf3";
  ctx.fillText(
    last.toLocaleString("en-US", { maximumFractionDigits: 2 }),
    20,
    84
  );
  ctx.font = "600 20px ui-monospace, Menlo, monospace";
  ctx.fillStyle = up ? "#26a69a" : "#ef5350";
  ctx.fillText(`${up ? "+" : ""}${pct.toFixed(2)}%`, 22, 112);

  const top = 130;
  const bottom = H - 16;
  const hi = Math.max(...candles.map((c) => c.high));
  const lo = Math.min(...candles.map((c) => c.low));
  const y = (v: number) => bottom - ((v - lo) / (hi - lo || 1)) * (bottom - top);
  const step = (W - 40) / candles.length;

  candles.forEach((c, i) => {
    const x = 20 + i * step + step / 2;
    const green = c.close >= c.open;
    ctx.strokeStyle = ctx.fillStyle = green ? "#26a69a" : "#ef5350";
    ctx.beginPath();
    ctx.moveTo(x, y(c.high));
    ctx.lineTo(x, y(c.low));
    ctx.stroke();
    const bodyTop = y(Math.max(c.open, c.close));
    const bodyH = Math.max(1, Math.abs(y(c.open) - y(c.close)));
    ctx.fillRect(x - step * 0.35, bodyTop, step * 0.7, bodyH);
  });
}

/** Live BTC mini-chart rendered to a canvas texture on the main monitor. */
export function MarketScreen({ width, height }: { width: number; height: number }) {
  const { candles, status } = useKlines("BTCUSDT", "15m", 64);

  const W = Math.round((H * width) / height);
  const { ctx, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return { ctx: canvas.getContext("2d")!, texture };
  }, [W]);

  useEffect(() => {
    draw(ctx, W, candles, status);
    texture.needsUpdate = true;
  }, [ctx, W, texture, candles, status]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      {/* colour > 1 so the screen blooms slightly */}
      <meshBasicMaterial map={texture} color={[1.6, 1.6, 1.6]} toneMapped={false} />
    </mesh>
  );
}
