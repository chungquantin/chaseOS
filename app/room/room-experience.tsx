"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Briefcase, Maximize, Monitor, Minus, Moon, Music2, Package, Plus, Sun, VolumeX } from "lucide-react";
import { media, useMedia } from "./media";
import { MiniPlayer } from "./mini-player";
import { interests } from "app/data/interests";
import { INTERACTABLES, type PanelId } from "./layout";
import { room, useRoom } from "./store";
import { visit } from "./tour";
import { Coach, hasSeenIntro, HudBadge, IdCard, LoadingScreen, markIntroSeen } from "./intro/intro";
import { JobsView } from "./panels/jobs-view";
import { ComputerOS } from "./os/os";
import { ProjectsView } from "./panels/projects-view";
import { WritingPanel, type PostSummary } from "./panels/writing-panel";

function SceneLoadError() {
  return (
    <div className="grid h-full place-items-center px-6 text-center text-[14px]">
      <p>
        The room didn’t load.{" "}
        <button className="underline" onClick={() => window.location.reload()}>
          Try again
        </button>{" "}
        or use the menu to browse.
      </p>
    </div>
  );
}

// If the 3D chunk fails to load (network, stale deploy), show a retry instead
// of hanging on the loading message forever.
const Scene = dynamic(() => import("./scene/scene").catch(() => SceneLoadError), {
  ssr: false,
  loading: () => (
    <div className="font-display grid h-full place-items-center text-[16px] opacity-60">Opening the door…</div>
  ),
});

function useRoomHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { active, action, nearby, stage } = room.get();
      if (stage !== "room") return;
      const typing = (e.target as HTMLElement).closest("input, textarea, select");
      if (!active && !typing && (e.key === "+" || e.key === "=")) return room.zoomBy(1.2);
      if (!active && !typing && (e.key === "-" || e.key === "_")) return room.zoomBy(1 / 1.2);
      if (!active && !typing && e.key === "0") return room.resetZoom();
      if (e.key === "Escape") {
        if (active) room.close();
        else if (action) room.stopAction();
      } else if ((e.key === "e" || e.key === "E") && !active && nearby) {
        const el = e.target as HTMLElement;
        if (el.closest("input, textarea, select")) return;
        room.use(nearby);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function renderPanel(id: PanelId, posts: PostSummary[]) {
  switch (id) {
    case "jobs":
      return <JobsView key="jobs" onClose={room.close} />;
    case "writing":
      return <WritingPanel key="writing" posts={posts} onClose={room.close} />;
    case "projects":
      return <ProjectsView key="projects" onClose={room.close} />;
    case "desk":
      return <ComputerOS key="desk" posts={posts} onClose={room.close} />;
  }
}

const THEME = {
  day: {
    bg: "bg-[radial-gradient(ellipse_at_50%_42%,#ffffff_0%,#ececec_55%,#cfcfcf_100%)]",
    text: "text-[#0a0a0a]",
  },
  night: {
    bg: "bg-[radial-gradient(ellipse_at_50%_45%,#1f1f1f_0%,#0f0f0f_50%,#000000_100%)]",
    text: "text-[#f5f5f5]",
  },
};

const QUICK: { id: PanelId; label: string; Icon: typeof Briefcase }[] = [
  { id: "jobs", label: "Past jobs", Icon: Briefcase },
  { id: "projects", label: "Projects", Icon: Package },
  { id: "writing", label: "Writing", Icon: BookOpen },
  { id: "desk", label: "Computer", Icon: Monitor },
];

/**
 * Keep the URL and the room in step: /blog and /blog/[slug] open the
 * bookshelf; closing the shelf there goes back to "/".
 */
function useRouteSync() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const onBlog = pathname.startsWith("/blog");
  const active = useRoom((s) => s.active);
  const prev = useRef(active);

  useEffect(() => {
    if (onBlog && room.get().active !== "writing") room.use("writing");
  }, [onBlog, pathname]);

  useEffect(() => {
    if (onBlog && prev.current === "writing" && active !== "writing") router.push("/", { scroll: false });
    prev.current = active;
  }, [active, onBlog, router]);
}

export function RoomExperience({ posts, children }: { posts: PostSummary[]; children?: ReactNode }) {
  useRoomHotkeys();
  useRouteSync();
  const pathname = usePathname() ?? "/";
  const deepLink = pathname.startsWith("/blog");
  const stage = useRoom((s) => s.stage);
  const ready = useRoom((s) => s.ready);
  const [coach, setCoach] = useState(false);

  // deep links (a blog post) skip the intro: the content is the point
  useEffect(() => {
    if (deepLink && room.get().stage === "loading") room.setStage("room");
  }, [deepLink]);

  const afterLoading = () => room.setStage(hasSeenIntro() ? "room" : "intro");
  const musicOn = useMedia((s) => s.playing);
  const toggleMusic = () => media.toggle();
  // returning visitors skip the card, so start on their first gesture
  useEffect(() => {
    if (stage !== "room") return;
    const kick = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.("[data-music-toggle]")) return;
      if (media.wanted() && !media.get().playing) media.play();
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    };
    window.addEventListener("pointerdown", kick);
    window.addEventListener("keydown", kick);
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const enterRoom = () => {
    if (media.wanted()) media.play(); // this click is the gesture browsers require
    const first = !hasSeenIntro();
    markIntroSeen();
    room.setStage("room");
    if (first) setTimeout(() => setCoach(true), 900);
  };

  const active = useRoom((s) => s.active);
  const action = useRoom((s) => s.action);
  const nearby = useRoom((s) => s.nearby);
  const mood = useRoom((s) => s.mood);
  const t = THEME[mood];
  const nearbyItem = INTERACTABLES.find((i) => i.id === nearby);
  const hud = active || stage !== "room" ? "pointer-events-none opacity-0" : "";
  const doing = action === "climb" ? interests.climbing : action === "game" ? interests.gaming : null;

  return (
    <div data-mood={mood} className={`room-ui fixed inset-0 overflow-hidden transition-colors duration-700 ${t.bg} ${t.text}`}>
      <div className="absolute inset-0" aria-hidden={active !== null}>
        <Scene />
      </div>

      {/* top-left: the ID card, shrunk into a badge (click to reopen) */}
      <header className={`absolute left-4 top-4 transition-opacity duration-300 sm:left-6 sm:top-5 ${hud}`}>
        {stage === "room" && <HudBadge onOpen={() => room.setStage("intro")} />}
      </header>

      {/* top-right: where to go, plus sound and light */}
      <nav aria-label="Room" className={`absolute right-4 top-4 flex items-start gap-2 transition-opacity duration-300 sm:right-6 sm:top-5 ${hud}`}>
        <div className="glass flex items-center gap-0.5 rounded-full p-1">
          {QUICK.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => room.use(id)} className="glass-btn px-2.5 py-1.5 text-[13px] sm:px-3">
              <Icon size={15} strokeWidth={1.8} className="opacity-80" />
              <span className="hidden md:inline">{label}</span>
              <span className="sr-only md:hidden">{label}</span>
            </button>
          ))}
        </div>
        <div className="glass flex items-center gap-0.5 rounded-full p-1">
          <button
            onClick={toggleMusic}
            data-music-toggle
            aria-label={musicOn ? "Mute music" : "Play music"}
            aria-pressed={musicOn}
            className="glass-btn size-8 justify-center"
          >
            {musicOn ? <Music2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            onClick={room.toggleMood}
            aria-label={mood === "day" ? "Switch to night" : "Switch to day"}
            className="glass-btn size-8 justify-center"
          >
            {mood === "day" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </nav>

      {/* right edge: zoom */}
      <div className={`glass absolute bottom-24 right-4 flex flex-col rounded-full p-1 transition-opacity sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2 ${hud}`}>
        <button onClick={() => room.zoomBy(1.25)} aria-label="Zoom in" className="glass-btn size-8 justify-center">
          <Plus size={16} />
        </button>
        <button onClick={room.resetZoom} aria-label="Fit the room" className="glass-btn size-8 justify-center">
          <Maximize size={13} />
        </button>
        <button onClick={() => room.zoomBy(1 / 1.25)} aria-label="Zoom out" className="glass-btn size-8 justify-center">
          <Minus size={16} />
        </button>
      </div>

      {/* bottom-centre: guide / what you can do here / what the character is doing */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4 sm:bottom-8">
        <AnimatePresence mode="wait">
          {stage !== "room" ? null : coach && !active ? (
            <Coach key="coach" onFinish={() => setCoach(false)} onGoToJobs={() => visit("jobs")} />
          ) : doing ? (
            <motion.div
              key="doing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass pointer-events-auto flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-[14px]"
            >
              <span className="font-display text-[16px]">{doing.caption}</span>
              <span className="hidden opacity-65 sm:inline">{doing.detail}</span>
              <button onClick={room.stopAction} className="glass-btn px-3 py-1.5 text-[13px]">
                Stop
              </button>
            </motion.div>
          ) : nearbyItem && !active ? (
            <motion.button
              key={nearbyItem.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => room.use(nearbyItem.id)}
              className="glass pointer-events-auto flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 text-[15px] active:scale-[0.98]"
            >
              <span className="keycap">E</span>
              <span className="font-display">{nearbyItem.verb}</span>
            </motion.button>
          ) : !active ? (
            <motion.button
              key="cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => visit("jobs")}
              className="lamp-btn pointer-events-auto px-5 py-2.5 text-[14px]"
            >
              <Briefcase size={15} strokeWidth={2} /> See my past jobs
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      {/* bottom-left: controls, as keycaps */}
      <div className={`pointer-events-none absolute bottom-5 left-4 hidden items-center gap-4 text-[12px] opacity-75 transition-opacity sm:left-6 lg:flex ${hud}`}>
        <span className="flex items-center gap-1.5">
          <span className="flex gap-0.5">
            {["W", "A", "S", "D"].map((k) => (
              <span key={k} className="keycap">{k}</span>
            ))}
          </span>
          walk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="keycap">E</span> use
        </span>
        <span className="flex items-center gap-1.5">
          <span className="keycap">Esc</span> close
        </span>
        <span>scroll to zoom</span>
      </div>

      <AnimatePresence>{active && renderPanel(active, posts)}</AnimatePresence>

      {/* the music player: stays up over panels so a playing video is always visible,
          but folds to a small strip so it doesn't cover the panel */}
      <MiniPlayer hidden={stage !== "room"} compact={!!active} />

      {/* route content: the open book on /blog/[slug], crawlable copy elsewhere */}
      {children}

      {/* first visit: loading doors → ID card → room */}
      <AnimatePresence>{stage === "intro" && <IdCard key="id" onEnter={enterRoom} />}</AnimatePresence>
      {stage === "loading" && !deepLink && <LoadingScreen ready={ready} mood={mood} onDone={afterLoading} />}
    </div>
  );
}
