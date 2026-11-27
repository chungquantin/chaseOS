"use client";

import { BUILT_APPS } from "app/data/apps";
import { MyApps } from "../os/my-apps";
import { CloseUpShell } from "./close-up-shell";

/** One built app, opened from its statue in the Projects building. */
export function AppPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const app = BUILT_APPS.find((a) => a.id === id);
  return (
    <CloseUpShell title={app?.name ?? "Projects"} hint={app?.tagline} onClose={onClose}>
      <div className="@container mx-auto h-[min(74vh,720px)] max-w-[920px] overflow-hidden rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        <MyApps arg={id} />
      </div>
    </CloseUpShell>
  );
}
