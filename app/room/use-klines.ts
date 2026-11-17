"use client";

import { useEffect, useState } from "react";

export type Candle = {
  /** unix seconds (lightweight-charts UTCTimestamp) */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type Base = {
  candles: Candle[];
  /** `${symbol}:${interval}` the candles belong to */
  source: string;
};

export type KlineState =
  | (Base & { status: "loading" | "live" | "stale" })
  | (Base & { status: "error"; message: string });

// Binance's public market-data mirror: CORS-enabled, no key, fewer geo blocks
// than api.binance.com.
const REST = "https://data-api.binance.vision/api/v3/klines";
const WS = "wss://data-stream.binance.vision/ws";

type RawKline = [number, string, string, string, string, string, ...unknown[]];

const toCandle = (k: RawKline): Candle => ({
  time: Math.floor(k[0] / 1000),
  open: +k[1],
  high: +k[2],
  low: +k[3],
  close: +k[4],
  volume: +k[5],
});

/**
 * Historical candles via REST, then live updates over a websocket.
 * Falls back to "stale" (last REST snapshot) if the socket drops.
 */
export function useKlines(symbol: string, interval: string, limit = 200) {
  const source = `${symbol}:${interval}`;
  const [state, setState] = useState<KlineState>({
    status: "loading",
    candles: [],
    source,
  });

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | null = null;
    setState({ status: "loading", candles: [], source });

    const url = `${REST}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Market data unavailable (${r.status})`);
        return r.json() as Promise<RawKline[]>;
      })
      .then((rows) => {
        if (cancelled) return;
        setState({ status: "live", candles: rows.map(toCandle), source });

        ws = new WebSocket(`${WS}/${symbol.toLowerCase()}@kline_${interval}`);
        ws.onmessage = (ev) => {
          const k = JSON.parse(ev.data).k;
          if (!k) return;
          const candle: Candle = {
            time: Math.floor(k.t / 1000),
            open: +k.o,
            high: +k.h,
            low: +k.l,
            close: +k.c,
            volume: +k.v,
          };
          setState((prev) => {
            const candles = prev.candles.slice();
            const last = candles[candles.length - 1];
            if (last && last.time === candle.time) {
              candles[candles.length - 1] = candle;
            } else if (!last || candle.time > last.time) {
              candles.push(candle);
              if (candles.length > limit) candles.shift();
            }
            return { status: "live", candles, source };
          });
        };
        ws.onerror = ws.onclose = () => {
          if (cancelled) return;
          setState((prev) =>
            prev.status === "error" ? prev : { ...prev, status: "stale" }
          );
        };
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ status: "error", candles: [], source, message: err.message });
      });

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, [symbol, interval, limit, source]);

  // Never hand back candles from a previous symbol/interval.
  return state.source === source
    ? state
    : ({ status: "loading", candles: [], source } as KlineState);
}
