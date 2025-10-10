"use client";

import { useState, useEffect } from "react";
import { Desktop } from "app/components/desktop-v2";
import { CompanyWindow, companies } from "app/components/company-window";
import { FinderWindow } from "app/components/finder-window";
import { FileText, Building2, Video, Folder } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { BaseWindow } from "./components/base-window";
import { MDXContent } from "./components/mdx-content";
import { CommandPalette } from "./components/command-palette";
import { TaskManagerWindow } from "./components/task-manager-window";
import { TerminalWindow } from "./components/terminal-window";
import { GitHubWindow } from "./components/github-window";
import { apps } from "./components/app-registry";

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
  startTime: number; // timestamp when window was opened
}

interface FinderWindowState {
  id: string;
  finderType: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  startTime: number; // timestamp when window was opened
}

interface CompanyWindowState {
  id: string;
  companyId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  startTime: number; // timestamp when window was opened
}

export default function Page() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [companyWindows, setCompanyWindows] = useState<CompanyWindowState[]>(
    []
  );
  const [finderWindows, setFinderWindows] = useState<FinderWindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);
  const [taskManagerZIndex, setTaskManagerZIndex] = useState(1000);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalZIndex, setTerminalZIndex] = useState(1000);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [gitHubZIndex, setGitHubZIndex] = useState(1000);

  useEffect(() => {
    // Fetch all posts
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data));

    // Fetch recent posts (past 2 months)
    fetch("/api/posts?recent=true")
      .then((res) => res.json())
      .then((data) => setRecentPosts(data));
  }, []);

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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

    // Calculate position based on existing windows to avoid overlap
    const baseX = 100;
    const baseY = 100;
    const offset = 30;

    // Find a position that doesn't overlap with existing windows
    let x = baseX;
    let y = baseY;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const overlapping = windows.some(
        (w) =>
          Math.abs(w.position.x - x) < 50 && Math.abs(w.position.y - y) < 50
      );

      if (!overlapping) break;

      x += offset;
      y += offset;
      attempts++;
    }

    const newWindow: WindowState = {
      id: windowId,
      post,
      position: { x, y },
      size: { width: 800, height: 600 },
      zIndex: nextZIndex,
      isMinimized: false,
      startTime: Date.now(),
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

  const bringTaskManagerToFront = () => {
    setTaskManagerZIndex(nextZIndex);
    setNextZIndex((prev) => prev + 1);
  };

  const bringTerminalToFront = () => {
    setTerminalZIndex(nextZIndex);
    setNextZIndex((prev) => prev + 1);
  };

  const bringGitHubToFront = () => {
    setGitHubZIndex(nextZIndex);
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

  const minimizeCompanyWindow = (windowId: string) => {
    setCompanyWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
    );
  };

  const restoreCompanyWindow = (windowId: string) => {
    setCompanyWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
      )
    );
    setNextZIndex((prev) => prev + 1);
  };

  const minimizeFinderWindow = (windowId: string) => {
    setFinderWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
    );
  };

  const restoreFinderWindow = (windowId: string) => {
    setFinderWindows((prev) =>
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

    // Calculate position based on existing windows to avoid overlap
    const baseX = 200;
    const baseY = 200;
    const offset = 30;

    // Find a position that doesn't overlap with existing windows
    let x = baseX;
    let y = baseY;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const overlapping = companyWindows.some(
        (w) =>
          Math.abs(w.position.x - x) < 50 && Math.abs(w.position.y - y) < 50
      );

      if (!overlapping) break;

      x += offset;
      y += offset;
      attempts++;
    }

    const newWindow: CompanyWindowState = {
      id: windowId,
      companyId,
      position: { x, y },
      size: { width: 700, height: 500 },
      zIndex: nextZIndex,
      isMinimized: false,
      startTime: Date.now(),
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

    // Calculate position based on existing windows to avoid overlap
    const baseX = 150;
    const baseY = 150;
    const offset = 30;

    // Find a position that doesn't overlap with existing windows
    let x = baseX;
    let y = baseY;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const overlapping = finderWindows.some(
        (w) =>
          Math.abs(w.position.x - x) < 50 && Math.abs(w.position.y - y) < 50
      );

      if (!overlapping) break;

      x += offset;
      y += offset;
      attempts++;
    }

    const newWindow: FinderWindowState = {
      id: windowId,
      finderType,
      position: { x, y },
      size: { width: 800, height: 600 },
      zIndex: nextZIndex,
      isMinimized: false,
      startTime: Date.now(),
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

  const openTaskManager = () => {
    setIsTaskManagerOpen(true);
  };

  const closeTaskManager = () => {
    setIsTaskManagerOpen(false);
  };

  const openTerminal = () => {
    setIsTerminalOpen(true);
  };

  const closeTerminal = () => {
    setIsTerminalOpen(false);
  };

  const openGitHub = () => {
    setIsGitHubOpen(true);
  };

  const closeGitHub = () => {
    setIsGitHubOpen(false);
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
            <div
              className="font-semibold font-sf-pro"
              style={{ color: "#f0f6fc" }}
            >
              ChaseOS
            </div>
            <div className="font-sf-pro" style={{ color: "#8b949e" }}>
              chungtin.eth
            </div>
          </div>
          <div
            className="flex items-center space-x-4"
            style={{ color: "#8b949e" }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-sf-pro">Online</span>
            </div>
            <div className="font-sf-pro">{new Date().toLocaleTimeString()}</div>
            <div className="font-sf-pro">{new Date().toLocaleDateString()}</div>
            <div className="flex items-center space-x-1">
              <span className="font-sf-pro">Search by</span>
              <kbd className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs font-sf-mono">
                ⌘K
              </kbd>
            </div>
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
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter font-sf-pro">
          chungtin.eth
        </h1>
        <p className="mb-4 font-sf-pro text-base leading-relaxed">
          I am a perpetual student of the digital realm, driven by an insatiable
          thirst for understanding the fundamental architectures that shape our
          technological future.
          <br />
          <br />
          My journey centers on the profound intersection of systems programming
          and distributed paradigms—where complexity meets elegance, and where
          the very foundations of computation reveal their deepest truths.
          <br />
          <br />
          My deepest admiration lies with the open source movement—a testament
          to humanity's capacity for collaborative creation and the
          democratization of knowledge itself.
        </p>
        {/* Desktop */}
        <Desktop
          onBlogPostClick={openWindow}
          onCompanyClick={openCompanyWindow}
          onFinderClick={openFinderWindow}
          onTaskManagerClick={openTaskManager}
          onTerminalClick={openTerminal}
          onGitHubClick={openGitHub}
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
                  items: [
                    {
                      id: "recent-posts",
                      name: "Recent Posts",
                      type: "folder" as const,
                      icon: Folder,
                      size: "12.5 KB",
                      modified: "2024-01-20",
                      description: "Latest blog posts",
                      onClick: () => {},
                      children: recentPosts.map((post) => ({
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
                    },
                    {
                      id: "all-posts",
                      name: "All Posts",
                      type: "folder" as const,
                      icon: Folder,
                      size: "45.2 KB",
                      modified: "2024-01-20",
                      description: "Complete blog archive",
                      onClick: () => {},
                      children: posts.map((post) => ({
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
                    },
                    {
                      id: "drafts",
                      name: "Drafts",
                      type: "folder" as const,
                      icon: Folder,
                      size: "8.1 KB",
                      modified: "2024-01-19",
                      description: "Work in progress",
                      onClick: () => {},
                      children: [
                        {
                          id: "draft-1",
                          name: "Upcoming Post Draft",
                          type: "file" as const,
                          icon: FileText,
                          size: "1.2 KB",
                          modified: "2024-01-19",
                          description: "Draft for upcoming blog post",
                          onClick: () => console.log("Opening draft"),
                        },
                      ],
                    },
                  ],
                };
                break;
              case "companies":
                finderData = {
                  title: "Companies",
                  items: [
                    {
                      id: "current-company",
                      name: "Current Company",
                      type: "folder" as const,
                      icon: Folder,
                      size: "5.2 KB",
                      modified: "2024-01-20",
                      description: "Current workplace",
                      onClick: () => {},
                      children: Object.entries(companies)
                        .filter(([_, company]) =>
                          company.duration.includes("2024")
                        )
                        .map(([id, company]) => ({
                          id,
                          name: company.name,
                          type: "file" as const,
                          icon: Building2,
                          size: "1.8 KB",
                          modified:
                            company.duration.split(" - ")[1] || "Present",
                          description: company.description,
                          onClick: () => openCompanyWindow(id),
                        })),
                    },
                    {
                      id: "past-companies",
                      name: "Past Companies",
                      type: "folder" as const,
                      icon: Folder,
                      size: "12.8 KB",
                      modified: "2024-01-20",
                      description: "Previous work experience",
                      onClick: () => {},
                      children: Object.entries(companies)
                        .filter(
                          ([_, company]) => !company.duration.includes("2024")
                        )
                        .map(([id, company]) => ({
                          id,
                          name: company.name,
                          type: "file" as const,
                          icon: Building2,
                          size: "1.8 KB",
                          modified:
                            company.duration.split(" - ")[1] || "Present",
                          description: company.description,
                          onClick: () => openCompanyWindow(id),
                        })),
                    },
                    {
                      id: "all-companies",
                      name: "All Companies",
                      type: "folder" as const,
                      icon: Folder,
                      size: "18.0 KB",
                      modified: "2024-01-20",
                      description: "Complete work history",
                      onClick: () => {},
                      children: Object.entries(companies).map(
                        ([id, company]) => ({
                          id,
                          name: company.name,
                          type: "file" as const,
                          icon: Building2,
                          size: "1.8 KB",
                          modified:
                            company.duration.split(" - ")[1] || "Present",
                          description: company.description,
                          onClick: () => openCompanyWindow(id),
                        })
                      ),
                    },
                  ],
                };
                break;
              case "videos":
                finderData = {
                  title: "Videos",
                  items: [
                    {
                      id: "tutorials",
                      name: "Tutorials",
                      type: "folder" as const,
                      icon: Folder,
                      size: "174.3 MB",
                      modified: "2024-01-20",
                      description: "Educational content",
                      onClick: () => {},
                      children: [
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
                          id: "tutorial-series",
                          name: "Rust Development Tutorial",
                          type: "file" as const,
                          icon: Video,
                          size: "128.5 MB",
                          modified: "2023-11-22",
                          description:
                            "Complete Rust programming tutorial series",
                          onClick: () => console.log("Opening tutorial series"),
                        },
                      ],
                    },
                    {
                      id: "talks",
                      name: "Tech Talks",
                      type: "folder" as const,
                      icon: Folder,
                      size: "45.8 MB",
                      modified: "2024-01-20",
                      description: "Technical presentations",
                      onClick: () => {},
                      children: [
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
                      ],
                    },
                    {
                      id: "all-videos",
                      name: "All Videos",
                      type: "folder" as const,
                      icon: Folder,
                      size: "189.5 MB",
                      modified: "2024-01-20",
                      description: "Complete video collection",
                      onClick: () => {},
                      children: [
                        {
                          id: "intro-video-all",
                          name: "Introduction Video",
                          type: "file" as const,
                          icon: Video,
                          size: "15.2 MB",
                          modified: "2024-01-15",
                          description: "Personal introduction and background",
                          onClick: () => console.log("Opening intro video"),
                        },
                        {
                          id: "tech-talk-all",
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
                          id: "tutorial-series-all",
                          name: "Rust Development Tutorial",
                          type: "file" as const,
                          icon: Video,
                          size: "128.5 MB",
                          modified: "2023-11-22",
                          description:
                            "Complete Rust programming tutorial series",
                          onClick: () => console.log("Opening tutorial series"),
                        },
                      ],
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
                onMinimize={() => minimizeFinderWindow(window.id)}
                onRestore={() => restoreFinderWindow(window.id)}
                onFocus={() => bringFinderToFront(window.id)}
                zIndex={window.zIndex}
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
              onMinimize={() => minimizeCompanyWindow(window.id)}
              onRestore={() => restoreCompanyWindow(window.id)}
              onFocus={() => bringCompanyToFront(window.id)}
              zIndex={window.zIndex}
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
              onFocus={() => bringToFront(window.id)}
              zIndex={window.zIndex}
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

      {/* Task Manager */}
      <AnimatePresence mode="wait">
        {isTaskManagerOpen && (
          <TaskManagerWindow
            windows={[
              ...windows.map((w) => ({
                ...w,
                post: w.post,
                startTime: w.startTime,
              })),
              ...companyWindows.map((w) => ({
                ...w,
                companyId: w.companyId,
                startTime: w.startTime,
              })),
              ...finderWindows.map((w) => ({
                ...w,
                finderType: w.finderType,
                startTime: w.startTime,
              })),
            ]}
            companies={companies}
            onClose={closeTaskManager}
            onFocus={() => {
              bringTaskManagerToFront();
            }}
            onCloseWindow={(windowId) => {
              if (windows.find((w) => w.id === windowId)) {
                closeWindow(windowId);
              } else if (companyWindows.find((w) => w.id === windowId)) {
                closeCompanyWindow(windowId);
              } else if (finderWindows.find((w) => w.id === windowId)) {
                closeFinderWindow(windowId);
              }
            }}
            onMinimizeWindow={(windowId) => {
              if (windows.find((w) => w.id === windowId)) {
                minimizeWindow(windowId);
              } else if (companyWindows.find((w) => w.id === windowId)) {
                minimizeCompanyWindow(windowId);
              } else if (finderWindows.find((w) => w.id === windowId)) {
                minimizeFinderWindow(windowId);
              }
            }}
            onRestoreWindow={(windowId) => {
              if (windows.find((w) => w.id === windowId)) {
                restoreWindow(windowId);
              } else if (companyWindows.find((w) => w.id === windowId)) {
                restoreCompanyWindow(windowId);
              } else if (finderWindows.find((w) => w.id === windowId)) {
                restoreFinderWindow(windowId);
              }
            }}
            zIndex={taskManagerZIndex}
            initialPosition={{ x: 300, y: 200 }}
            initialSize={{ width: 900, height: 600 }}
          />
        )}
      </AnimatePresence>

      {/* Terminal */}
      <AnimatePresence mode="wait">
        {isTerminalOpen && (
          <TerminalWindow
            onClose={closeTerminal}
            onFocus={() => {
              bringTerminalToFront();
            }}
            onOpenApp={(appId) => {
              const app = apps.find((a) => a.id === appId);
              if (app?.type === "finder") {
                openFinderWindow(app.finderType!);
              } else if (appId === "task-manager") {
                openTaskManager();
              }
            }}
            onOpenFinder={openFinderWindow}
            onOpenTaskManager={openTaskManager}
            onCloseWindow={(windowId) => {
              if (windows.find((w) => w.id === windowId)) {
                closeWindow(windowId);
              } else if (companyWindows.find((w) => w.id === windowId)) {
                closeCompanyWindow(windowId);
              } else if (finderWindows.find((w) => w.id === windowId)) {
                closeFinderWindow(windowId);
              }
            }}
            onMinimizeWindow={(windowId) => {
              if (windows.find((w) => w.id === windowId)) {
                minimizeWindow(windowId);
              } else if (companyWindows.find((w) => w.id === windowId)) {
                minimizeCompanyWindow(windowId);
              } else if (finderWindows.find((w) => w.id === windowId)) {
                minimizeFinderWindow(windowId);
              }
            }}
            onRestoreWindow={(windowId) => {
              if (windows.find((w) => w.id === windowId)) {
                restoreWindow(windowId);
              } else if (companyWindows.find((w) => w.id === windowId)) {
                restoreCompanyWindow(windowId);
              } else if (finderWindows.find((w) => w.id === windowId)) {
                restoreFinderWindow(windowId);
              }
            }}
            windows={[
              ...windows.map((w) => ({ ...w, startTime: w.startTime })),
              ...companyWindows.map((w) => ({ ...w, startTime: w.startTime })),
              ...finderWindows.map((w) => ({ ...w, startTime: w.startTime })),
            ]}
            zIndex={terminalZIndex}
            initialPosition={{ x: 250, y: 150 }}
            initialSize={{ width: 800, height: 600 }}
          />
        )}
      </AnimatePresence>

      {/* GitHub */}
      <AnimatePresence mode="wait">
        {isGitHubOpen && (
          <GitHubWindow
            onClose={closeGitHub}
            onFocus={() => {
              bringGitHubToFront();
            }}
            zIndex={gitHubZIndex}
            initialPosition={{ x: 300, y: 150 }}
            initialSize={{ width: 1000, height: 700 }}
          />
        )}
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

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onBlogPostClick={openWindow}
        onCompanyClick={openCompanyWindow}
        onFinderClick={openFinderWindow}
        onTaskManagerClick={openTaskManager}
        onTerminalClick={openTerminal}
        onGitHubClick={openGitHub}
        blogPosts={posts}
      />
    </div>
  );
}
