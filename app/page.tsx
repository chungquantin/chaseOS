"use client";

import { useState, useEffect } from "react";
import { Desktop } from "app/components/desktop-v2";
import { CompanyWindow, companies } from "app/components/company-window";
import { FinderWindow } from "app/components/finder-window";
import { FileText, Building2, Video } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { BaseWindow } from "./components/base-window";
import { MDXContent } from "./components/mdx-content";

export type BlogPost = {
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
  };
  slug: string;
  content: string;
};

interface WindowState {
  id: string;
  post: BlogPost;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
}

interface FinderWindowState {
  id: string;
  finderType: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
}

interface CompanyWindowState {
  id: string;
  companyId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
}

export default function Page() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [companyWindows, setCompanyWindows] = useState<CompanyWindowState[]>(
    []
  );
  const [finderWindows, setFinderWindows] = useState<FinderWindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  const openWindow = (post: BlogPost) => {
    const windowId = `window-${post.slug}`;

    // Check if window is already open
    const existingWindow = windows.find((w) => w.id === windowId);
    if (existingWindow) {
      // Bring to front
      bringToFront(windowId);
      return;
    }

    const newWindow: WindowState = {
      id: windowId,
      post,
      position: {
        x: 100 + windows.length * 30,
        y: 100 + windows.length * 30,
      },
      size: { width: 800, height: 600 },
      zIndex: nextZIndex,
      isMinimized: false,
    };

    setWindows((prev) => [...prev, newWindow]);
    setNextZIndex((prev) => prev + 1);
  };

  const closeWindow = (windowId: string) => {
    console.log("Closing window", windowId);
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
  };

  const bringToFront = (windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextZIndex } : w))
    );
    setNextZIndex((prev) => prev + 1);
  };

  const minimizeWindow = (windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
    );
  };

  const restoreWindow = (windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
      )
    );
    setNextZIndex((prev) => prev + 1);
  };

  const openCompanyWindow = (companyId: string) => {
    const windowId = `company-${companyId}`;

    // Check if window is already open
    const existingWindow = companyWindows.find((w) => w.id === windowId);
    if (existingWindow) {
      // Bring to front
      bringCompanyToFront(windowId);
      return;
    }

    const newWindow: CompanyWindowState = {
      id: windowId,
      companyId,
      position: {
        x: 200 + companyWindows.length * 30,
        y: 200 + companyWindows.length * 30,
      },
      size: { width: 700, height: 500 },
      zIndex: nextZIndex,
      isMinimized: false,
    };

    setCompanyWindows((prev) => [...prev, newWindow]);
    setNextZIndex((prev) => prev + 1);
  };

  const closeCompanyWindow = (windowId: string) => {
    setCompanyWindows((prev) => prev.filter((w) => w.id !== windowId));
  };

  const bringCompanyToFront = (windowId: string) => {
    setCompanyWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextZIndex } : w))
    );
    setNextZIndex((prev) => prev + 1);
  };

  const openFinderWindow = (finderType: string) => {
    const windowId = `finder-${finderType}`;

    // Check if window is already open
    const existingWindow = finderWindows.find((w) => w.id === windowId);
    if (existingWindow) {
      // Bring to front
      bringFinderToFront(windowId);
      return;
    }

    const newWindow: FinderWindowState = {
      id: windowId,
      finderType,
      position: {
        x: 150 + finderWindows.length * 30,
        y: 150 + finderWindows.length * 30,
      },
      size: { width: 800, height: 600 },
      zIndex: nextZIndex,
      isMinimized: false,
    };

    setFinderWindows((prev) => [...prev, newWindow]);
    setNextZIndex((prev) => prev + 1);
  };

  const closeFinderWindow = (windowId: string) => {
    setFinderWindows((prev) => prev.filter((w) => w.id !== windowId));
  };

  const bringFinderToFront = (windowId: string) => {
    setFinderWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextZIndex } : w))
    );
    setNextZIndex((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen">
      {/* ChaseOS Status Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "#0d1117",
          borderBottom: "1px solid #21262d",
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center space-x-4">
            <div className="font-semibold" style={{ color: "#f0f6fc" }}>
              ChaseOS
            </div>
            <div style={{ color: "#8b949e" }}>chungtin.eth</div>
          </div>
          <div
            className="flex items-center space-x-4"
            style={{ color: "#8b949e" }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <div>{new Date().toLocaleTimeString()}</div>
            <div>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Desktop Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/brand/wallpaper.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Main Content */}
      <section className="relative z-10 pt-16">
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
          chungtin.eth
        </h1>
        <p className="mb-4">
          i am a perpetual student of the digital realm, driven by an insatiable
          thirst for understanding the fundamental architectures that shape our
          technological future.
          <br />
          <br />
          my journey centers on the profound intersection of systems programming
          and distributed paradigms—where complexity meets elegance, and where
          the very foundations of computation reveal their deepest truths.
          <br />
          <br />
          my deepest admiration lies with the open source movement—a testament
          to humanity's capacity for collaborative creation and the
          democratization of knowledge itself.
        </p>
        {/* Desktop */}
        <Desktop
          onBlogPostClick={openWindow}
          onCompanyClick={openCompanyWindow}
          onFinderClick={openFinderWindow}
          blogPosts={posts}
        />
      </section>
      {/* Finder Windows */}
      <AnimatePresence mode="wait">
        {finderWindows
          .filter((window) => !window.isMinimized)
          .map((window) => {
            let finderData;
            switch (window.finderType) {
              case "blogs":
                finderData = {
                  title: "Blogs",
                  items: posts.map((post) => ({
                    id: post.slug,
                    name: post.metadata.title,
                    type: "file" as const,
                    icon: FileText,
                    size: "2.3 KB",
                    modified: new Date(
                      post.metadata.publishedAt
                    ).toLocaleDateString(),
                    description: post.metadata.summary,
                    onClick: () => openWindow(post),
                  })),
                };
                break;
              case "companies":
                finderData = {
                  title: "Companies",
                  items: Object.entries(companies).map(([id, company]) => ({
                    id,
                    name: company.name,
                    type: "file" as const,
                    icon: Building2,
                    size: "1.8 KB",
                    modified: company.duration.split(" - ")[1] || "Present",
                    description: company.description,
                    onClick: () => openCompanyWindow(id),
                  })),
                };
                break;
              case "videos":
                finderData = {
                  title: "Videos",
                  items: [
                    {
                      id: "intro-video",
                      name: "Introduction Video",
                      type: "file" as const,
                      icon: Video,
                      size: "15.2 MB",
                      modified: "2024-01-15",
                      description: "Personal introduction and background",
                      onClick: () => console.log("Opening intro video"),
                    },
                    {
                      id: "tech-talk",
                      name: "Blockchain Technology Talk",
                      type: "file" as const,
                      icon: Video,
                      size: "45.8 MB",
                      modified: "2023-12-10",
                      description:
                        "Technical presentation on blockchain development",
                      onClick: () => console.log("Opening tech talk video"),
                    },
                    {
                      id: "tutorial-series",
                      name: "Rust Development Tutorial",
                      type: "file" as const,
                      icon: Video,
                      size: "128.5 MB",
                      modified: "2023-11-22",
                      description: "Complete Rust programming tutorial series",
                      onClick: () => console.log("Opening tutorial series"),
                    },
                  ],
                };
                break;
              default:
                finderData = { title: "Unknown", items: [] };
            }

            return (
              <FinderWindow
                key={window.id}
                title={finderData.title}
                items={finderData.items}
                onClose={() => closeFinderWindow(window.id)}
                initialPosition={window.position}
                initialSize={window.size}
              />
            );
          })}
      </AnimatePresence>

      {/* Company Windows */}
      <AnimatePresence mode="wait">
        {companyWindows
          .filter((window) => !window.isMinimized)
          .map((window) => (
            <CompanyWindow
              key={window.id}
              company={companies[window.companyId]}
              onClose={() => closeCompanyWindow(window.id)}
              initialPosition={window.position}
              initialSize={window.size}
            />
          ))}
      </AnimatePresence>

      {/* Windows */}
      <AnimatePresence mode="wait">
        {windows
          .filter((window) => !window.isMinimized)
          .map((window) => (
            <BaseWindow
              key={window.id}
              title={window.post.metadata.title}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onRestore={() => restoreWindow(window.id)}
              initialPosition={window.position}
              initialSize={window.size}
            >
              <div
                className="h-full overflow-auto p-6"
                style={{ backgroundColor: "#0d1117" }}
              >
                <div className="prose dark:prose-invert max-w-none overflow-hidden break-words">
                  <h1
                    className="text-2xl font-bold mb-4"
                    style={{ color: "#f0f6fc" }}
                  >
                    {window.post.metadata.title}
                  </h1>
                  <div className="text-sm mb-6" style={{ color: "#8b949e" }}>
                    {new Date(
                      window.post.metadata.publishedAt
                    ).toLocaleDateString()}
                  </div>
                  <div className="overflow-hidden break-words">
                    <MDXContent content={window.post.content} />
                  </div>
                </div>
              </div>
            </BaseWindow>
          ))}
      </AnimatePresence>

      {/* Taskbar */}
      {(windows.length > 0 ||
        companyWindows.length > 0 ||
        finderWindows.length > 0) && (
        <div
          className="fixed bottom-0 left-0 right-0 p-2 z-40"
          style={{ backgroundColor: "#0d1117", borderTop: "1px solid #21262d" }}
        >
          <div className="flex space-x-2">
            {finderWindows.map((window) => (
              <button
                key={window.id}
                onClick={() => bringFinderToFront(window.id)}
                className="px-3 py-1 text-xs rounded border transition-colors"
                style={{
                  backgroundColor: "#21262d",
                  color: "#f0f6fc",
                  borderColor: "#30363d",
                }}
              >
                {window.finderType.charAt(0).toUpperCase() +
                  window.finderType.slice(1)}
              </button>
            ))}
            {windows.map((window) => (
              <button
                key={window.id}
                onClick={() =>
                  window.isMinimized
                    ? restoreWindow(window.id)
                    : bringToFront(window.id)
                }
                className="px-3 py-1 text-xs rounded border transition-colors"
                style={{
                  backgroundColor: window.isMinimized ? "#161b22" : "#21262d",
                  color: window.isMinimized ? "#8b949e" : "#f0f6fc",
                  borderColor: window.isMinimized ? "#21262d" : "#30363d",
                }}
              >
                {window.post.metadata.title.length > 20
                  ? `${window.post.metadata.title.substring(0, 20)}...`
                  : window.post.metadata.title}
              </button>
            ))}
            {companyWindows.map((window) => (
              <button
                key={window.id}
                onClick={() => bringCompanyToFront(window.id)}
                className="px-3 py-1 text-xs rounded border transition-colors"
                style={{
                  backgroundColor: "#21262d",
                  color: "#f0f6fc",
                  borderColor: "#30363d",
                }}
              >
                {companies[window.companyId].name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
