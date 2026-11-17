import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Can this page be shown inside an iframe? The computer's Browser asks
 * before loading a site, so it can offer "open in a new tab" instead of a
 * blank frame. Only reads response headers; never returns page content.
 */

const PRIVATE_V4 = [/^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^0\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./];

function isPrivate(ip: string) {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:127.") || v === "::";
  }
  return PRIVATE_V4.some((r) => r.test(ip));
}

async function safeUrl(raw: string): Promise<URL | null> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname;
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
  try {
    const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    if (addrs.some((a) => isPrivate(a.address))) return null;
  } catch {
    return null;
  }
  return url;
}

function blockedBy(headers: Headers): string | null {
  const xfo = headers.get("x-frame-options")?.toLowerCase();
  if (xfo && (xfo.includes("deny") || xfo.includes("sameorigin"))) return "x-frame-options";
  const csp = headers.get("content-security-policy")?.toLowerCase() ?? "";
  const fa = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("frame-ancestors"));
  if (fa && !/\s\*(\s|$)/.test(` ${fa.slice("frame-ancestors".length)} `)) return "frame-ancestors";
  return null;
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url") ?? "";
  let url = await safeUrl(raw);
  if (!url) return NextResponse.json({ embeddable: false, reason: "invalid" }, { status: 400 });

  try {
    // follow a few redirects by hand so every hop is checked
    for (let hop = 0; hop < 4; hop++) {
      const res = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RoomOS-Browser/1.0)", Accept: "text/html" },
        signal: AbortSignal.timeout(5000),
      });
      res.body?.cancel().catch(() => {});
      const loc = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && loc) {
        const next = await safeUrl(new URL(loc, url).toString());
        if (!next) return NextResponse.json({ embeddable: false, reason: "invalid" });
        url = next;
        continue;
      }
      const reason = blockedBy(res.headers);
      return NextResponse.json(
        { embeddable: !reason, reason, finalUrl: url.toString(), status: res.status },
        { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
      );
    }
    return NextResponse.json({ embeddable: false, reason: "redirects" });
  } catch {
    return NextResponse.json({ embeddable: false, reason: "unreachable" });
  }
}
