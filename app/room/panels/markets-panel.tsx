"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useKlines, type Candle } from "../use-klines";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "DOTUSDT"];
const INTERVALS = ["15m", "1h", "4h", "1d"];

const UP = "#fafafa";
const DOWN = "#f0a04b";

const toBar = (c: Candle) => ({
  time: c.time as UTCTimestamp,
  open: c.open,
  high: c.high,
  low: c.low,
  close: c.close,
});
const toVol = (c: Candle) => ({
  time: c.time as UTCTimestamp,
  value: c.volume,
  color: c.close >= c.open ? "rgba(38,166,154,0.35)" : "rgba(239,83,80,0.35)",
});

const fmt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: n < 10 ? 4 : 2 });

/** Live candles with symbol/interval pickers; fills its container. */
export function MarketsTerminal() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1h");
  const data = useKlines(symbol, interval);

  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candles = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volume = useRef<ISeriesApi<"Histogram"> | null>(null);
  const loadedKey = useRef<string | null>(null);

  useEffect(() => {
    const c = createChart(el.current!, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: "#a3a3a3",
        fontFamily: "ui-monospace, Menlo, monospace",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
      timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true },
    });
    candles.current = c.addCandlestickSeries({
      upColor: UP,
      downColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      borderVisible: false,
    });
    volume.current = c.addHistogramSeries({ priceScaleId: "", priceFormat: { type: "volume" } });
    volume.current.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    chart.current = c;
    return () => {
      c.remove();
      chart.current = null;
      loadedKey.current = null;
    };
  }, []);

  // Full reload on symbol/interval change; incremental update for live ticks.
  useEffect(() => {
    const rows = data.candles;
    if (!candles.current || !volume.current || rows.length === 0) return;
    const key = data.source;
    if (loadedKey.current !== key) {
      candles.current.setData(rows.map(toBar));
      volume.current.setData(rows.map(toVol));
      chart.current?.timeScale().fitContent();
      loadedKey.current = key;
    } else {
      const last = rows[rows.length - 1];
      candles.current.update(toBar(last));
      volume.current.update(toVol(last));
    }
  }, [data.candles, data.source]);

  const rows = data.candles;
  const last = rows[rows.length - 1];
  const first = rows[0];
  const change = last && first ? ((last.close - first.open) / first.open) * 100 : 0;
  const hi = rows.length ? Math.max(...rows.map((r) => r.high)) : 0;
  const lo = rows.length ? Math.min(...rows.map((r) => r.low)) : 0;

  const pill = (active: boolean) =>
    [
      "rounded-md px-2.5 py-1 font-mono text-[12px] transition-colors",
      active ? "bg-white/10 text-white" : "text-[#8a8a8a] hover:text-[#e5e5e5]",
    ].join(" ");

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0a0a0a] text-[#fafafa]">
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 pt-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-[12px] text-[#8a8a8a]">
            <span
              className={[
                "size-2 rounded-full",
                data.status === "live" ? "bg-[#fafafa]" : data.status === "error" ? "bg-[#737373]" : "bg-[#f0a04b]",
              ].join(" ")}
            />
            {symbol.replace("USDT", "/USDT")} · {data.status}
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-[30px] font-semibold tabular-nums">
              {last ? fmt(last.close) : "—"}
            </span>
            {last && (
              <span className="font-mono text-[14px] tabular-nums" style={{ color: change >= 0 ? UP : DOWN }}>
                {change >= 0 ? "+" : ""}
                {change.toFixed(2)}%
              </span>
            )}
          </div>
          {last && (
            <p className="mt-0.5 font-mono text-[11px] text-[#8a8a8a] tabular-nums">
              H {fmt(hi)} · L {fmt(lo)} · window of {rows.length} candles
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-1">
            {SYMBOLS.map((s) => (
              <button key={s} className={pill(s === symbol)} onClick={() => setSymbol(s)}>
                {s.replace("USDT", "")}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {INTERVALS.map((i) => (
              <button key={i} className={pill(i === interval)} onClick={() => setInterval(i)}>
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative mx-2 mb-2 mt-3 min-h-[220px] flex-1">
        <div ref={el} className="absolute inset-0" />
        {data.status === "error" && (
          <p className="absolute inset-0 grid place-items-center font-mono text-[13px] text-[#8a8a8a]">
            {data.message}
          </p>
        )}
      </div>
      <p className="px-6 pb-4 font-mono text-[10px] text-[#737373]">
        Public spot market data from Binance. Not financial advice.
      </p>
    </div>
  );
}
