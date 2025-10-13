"use client";

import { useState, useEffect, useRef } from "react";
import { Desktop } from "app/components/desktop-v2";
import { CompanyWindow, companies } from "app/components/company-window";
import { FinderWindow } from "app/components/finder-window";
import { FileText, Building2, Video, Folder } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { BaseWindow } from "./components/base-window";
import { MDXContent } from "./components/mdx-content";
import { CommandPalette } from "./components/command-palette";
import { TaskManagerWindow } from "./components/task-manager-window";
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

// Unified window content types
type WindowContent =
  | { type: "blog"; post: BlogPost }
  | { type: "company"; companyId: string }
  | { type: "finder"; finderType: string };

// Single unified window state
interface WindowState {
  id: string;
  content: WindowContent;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  startTime: number;
}

// Finder data factory functions
const getBlogsFinderData = (
  recentPosts: BlogPost[],
  posts: BlogPost[],
  openBlogWindow: (post: BlogPost) => void
) => ({
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
        modified: new Date(post.metadata.publishedAt).toLocaleDateString(),
        description: post.metadata.summary,
        onClick: () => openBlogWindow(post),
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
        modified: new Date(post.metadata.publishedAt).toLocaleDateString(),
        description: post.metadata.summary,
        onClick: () => openBlogWindow(post),
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
});

const getCompaniesFinderData = (
  companies: Record<
    string,
    { name: string; duration: string; description: string }
  >,
  openCompanyWindow: (id: string) => void
) => ({
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
        .filter(([_, company]) => company.duration.includes("2024"))
        .map(([id, company]) => ({
          id,
          name: company.name,
          type: "file" as const,
          icon: Building2,
          size: "1.8 KB",
          modified: company.duration.split(" - ")[1] || "Present",
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
        .filter(([_, company]) => !company.duration.includes("2024"))
        .map(([id, company]) => ({
          id,
          name: company.name,
          type: "file" as const,
          icon: Building2,
          size: "1.8 KB",
          modified: company.duration.split(" - ")[1] || "Present",
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
      children: Object.entries(companies).map(([id, company]) => ({
        id,
        name: company.name,
        type: "file" as const,
        icon: Building2,
        size: "1.8 KB",
        modified: company.duration.split(" - ")[1] || "Present",
        description: company.description,
        onClick: () => openCompanyWindow(id),
      })),
    },
  ],
});

const getVideosFinderData = () => ({
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
          description: "Complete Rust programming tutorial series",
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
          description: "Technical presentation on blockchain development",
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
          description: "Technical presentation on blockchain development",
          onClick: () => console.log("Opening tech talk video"),
        },
        {
          id: "tutorial-series-all",
          name: "Rust Development Tutorial",
          type: "file" as const,
          icon: Video,
          size: "128.5 MB",
          modified: "2023-11-22",
          description: "Complete Rust programming tutorial series",
          onClick: () => console.log("Opening tutorial series"),
        },
      ],
    },
  ],
});

// Custom hook for persisted state
function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error loading persisted state for key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error saving persisted state for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

// Validate and fix window positions to ensure they're on screen
const validateWindowPosition = (
  position: { x: number; y: number },
  size: { width: number; height: number }
): { x: number; y: number } => {
  const maxX = window.innerWidth - 100; // Keep at least 100px visible
  const maxY = window.innerHeight - 100;

  return {
    x: Math.max(0, Math.min(position.x, maxX)),
    y: Math.max(0, Math.min(position.y, maxY)),
  };
};

export default function Page() {
  const [windows, setWindows] = usePersistedState<WindowState[]>(
    "chaseOS_windows",
    []
  );
  const [nextZIndex, setNextZIndex] = usePersistedState<number>(
    "chaseOS_nextZIndex",
    1000
  );
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = usePersistedState<boolean>(
    "chaseOS_taskManager",
    false
  );
  const [taskManagerZIndex, setTaskManagerZIndex] = usePersistedState<number>(
    "chaseOS_taskManagerZIndex",
    1000
  );
  const [isGitHubOpen, setIsGitHubOpen] = usePersistedState<boolean>(
    "chaseOS_github",
    false
  );
  const [gitHubZIndex, setGitHubZIndex] = usePersistedState<number>(
    "chaseOS_githubZIndex",
    1000
  );
  const [gitHubStartTime, setGitHubStartTime] = usePersistedState<number>(
    "chaseOS_githubStartTime",
    Date.now()
  );

  // Validate window positions on mount and screen resize
  useEffect(() => {
    const validatePositions = () => {
      setWindows((prev) =>
        prev.map((w) => ({
          ...w,
          position: validateWindowPosition(w.position, w.size),
        }))
      );
    };

    // Validate on mount
    if (windows.length > 0) {
      validatePositions();
    }

    // Validate on window resize
    window.addEventListener("resize", validatePositions);
    return () => window.removeEventListener("resize", validatePositions);
  }, []);

  // Log restored windows for debugging
  useEffect(() => {
    if (windows.length > 0) {
      console.log(
        "Restored windows from localStorage:",
        windows.map((w) => ({
          id: w.id,
          type: w.content.type,
          position: w.position,
          size: w.size,
          zIndex: w.zIndex,
        }))
      );
    }
  }, []);

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

  // Unified window management
  const openWindow = (
    id: string,
    content: WindowContent,
    defaultSize = { width: 800, height: 600 },
    basePosition = { x: 100, y: 100 }
  ) => {
    // Check if window is already open
    const existingWindow = windows.find((w) => w.id === id);
    if (existingWindow) {
      bringToFront(id);
      return;
    }

    console.log("openWindow called, id:", id, windows);

    // Calculate position based on existing windows to avoid overlap
    const offset = 30;
    let x = basePosition.x;
    let y = basePosition.y;
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
      id,
      content,
      position: { x, y },
      size: defaultSize,
      zIndex: nextZIndex,
      isMinimized: false,
      startTime: Date.now(),
    };

    setWindows((prev) => [...prev, newWindow]);
    setNextZIndex((prev) => prev + 1);
  };

  const closeWindow = (windowId: string) => {
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

  // Debounce timers for position and size updates
  const positionTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const sizeTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Update window position with debouncing (called when user drags window)
  const updateWindowPosition = (
    windowId: string,
    position: { x: number; y: number }
  ) => {
    // Clear existing timer for this window
    if (positionTimersRef.current[windowId]) {
      clearTimeout(positionTimersRef.current[windowId]);
    }

    // Set new timer to update state after 500ms of no changes
    positionTimersRef.current[windowId] = setTimeout(() => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, position } : w))
      );
      delete positionTimersRef.current[windowId];
    }, 500);
  };

  // Update window size with debouncing (called when user resizes window)
  const updateWindowSize = (
    windowId: string,
    size: { width: number; height: number }
  ) => {
    // Clear existing timer for this window
    if (sizeTimersRef.current[windowId]) {
      clearTimeout(sizeTimersRef.current[windowId]);
    }

    // Set new timer to update state after 500ms of no changes
    sizeTimersRef.current[windowId] = setTimeout(() => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, size } : w))
      );
      delete sizeTimersRef.current[windowId];
    }, 500);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(positionTimersRef.current).forEach(clearTimeout);
      Object.values(sizeTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  // Helper functions for opening specific window types
  const openBlogWindow = (post: BlogPost) => {
    openWindow(`blog-${post.slug}`, { type: "blog", post });
  };

  const openCompanyWindow = (companyId: string) => {
    openWindow(
      `company-${companyId}`,
      { type: "company", companyId },
      { width: 700, height: 500 },
      { x: 200, y: 200 }
    );
  };

  const openFinderWindow = (finderType: string) => {
    openWindow(
      `finder-${finderType}`,
      { type: "finder", finderType },
      { width: 800, height: 600 },
      { x: 150, y: 150 }
    );
  };

  const bringTaskManagerToFront = () => {
    setTaskManagerZIndex(nextZIndex);
    setNextZIndex((prev) => prev + 1);
  };

  const bringGitHubToFront = () => {
    setGitHubZIndex(nextZIndex);
    setNextZIndex((prev) => prev + 1);
  };

  const openTaskManager = () => {
    if (isTaskManagerOpen) {
      bringTaskManagerToFront();
    } else {
      setIsTaskManagerOpen(true);
    }
  };

  const closeTaskManager = () => {
    setIsTaskManagerOpen(false);
  };

  const openGitHub = () => {
    if (isGitHubOpen) {
      bringGitHubToFront();
    } else {
      setGitHubStartTime(Date.now());
      setIsGitHubOpen(true);
    }
  };

  const closeGitHub = () => {
    setIsGitHubOpen(false);
  };

  // Clear all persisted state (useful for debugging)
  const clearPersistedState = () => {
    localStorage.removeItem("chaseOS_windows");
    localStorage.removeItem("chaseOS_nextZIndex");
    localStorage.removeItem("chaseOS_taskManager");
    localStorage.removeItem("chaseOS_taskManagerZIndex");
    localStorage.removeItem("chaseOS_github");
    localStorage.removeItem("chaseOS_githubZIndex");
    localStorage.removeItem("chaseOS_githubStartTime");
    window.location.reload();
  };

  // Add keyboard shortcut to clear state (Cmd+Shift+K)
  useEffect(() => {
    const handleClearState = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "K") {
        e.preventDefault();
        if (confirm("Clear all persisted state and reload?")) {
          clearPersistedState();
        }
      }
    };

    document.addEventListener("keydown", handleClearState);
    return () => document.removeEventListener("keydown", handleClearState);
  }, []);

  // Expose clear function to console for debugging
  useEffect(() => {
    (window as any).clearChaseOSState = clearPersistedState;
    console.log(
      "ChaseOS Debug: Call window.clearChaseOSState() to reset all persisted state"
    );
  }, []);

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
            {windows.length > 0 && (
              <div className="flex items-center space-x-1 text-xs">
                <span className="font-sf-pro">
                  {windows.length} window{windows.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <div className="font-sf-pro">{new Date().toLocaleTimeString()}</div>
            <div className="font-sf-pro">{new Date().toLocaleDateString()}</div>
            <div className="flex items-center space-x-1">
              <span className="font-sf-pro">Search by</span>
              <kbd className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs font-sf-mono">
                ⌘K
              </kbd>
            </div>
            <button
              onClick={clearPersistedState}
              className="flex items-center space-x-1 text-xs hover:text-red-400 transition-colors"
              title="Clear persisted state (⌘⇧K)"
            >
              <span className="font-sf-pro">Reset</span>
            </button>
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
        <img
          src="/brand/profile-avatar.png"
          alt="chungtin.eth"
          className="w-20 h-20 rounded-lg"
        />
        <h1 className="mt-6 mb-8 text-2xl font-semibold tracking-tighter font-sf-pro">
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
          onBlogPostClick={openBlogWindow}
          onCompanyClick={openCompanyWindow}
          onFinderClick={openFinderWindow}
          onTaskManagerClick={openTaskManager}
          onGitHubClick={openGitHub}
        />
      </section>
      {/* Unified Windows */}
      <AnimatePresence>
        {windows
          .filter((window) => !window.isMinimized)
          .map((window) => {
            // Render based on content type
            if (window.content.type === "finder") {
              let finderData;
              switch (window.content.finderType) {
                case "blogs":
                  finderData = getBlogsFinderData(
                    recentPosts,
                    posts,
                    openBlogWindow
                  );
                  break;
                case "companies":
                  finderData = getCompaniesFinderData(
                    companies,
                    openCompanyWindow
                  );
                  break;
                case "videos":
                  finderData = getVideosFinderData();
                  break;
                default:
                  finderData = { title: "Unknown", items: [] };
              }

              return (
                <FinderWindow
                  key={window.id}
                  title={finderData.title}
                  items={finderData.items}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onRestore={() => restoreWindow(window.id)}
                  onFocus={() => bringToFront(window.id)}
                  onPositionChange={(pos) =>
                    updateWindowPosition(window.id, pos)
                  }
                  onSizeChange={(size) => updateWindowSize(window.id, size)}
                  zIndex={window.zIndex}
                  initialPosition={window.position}
                  initialSize={window.size}
                />
              );
            }

            if (window.content.type === "company") {
              return (
                <CompanyWindow
                  key={window.id}
                  company={companies[window.content.companyId]}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onRestore={() => restoreWindow(window.id)}
                  onFocus={() => bringToFront(window.id)}
                  onPositionChange={(pos) =>
                    updateWindowPosition(window.id, pos)
                  }
                  onSizeChange={(size) => updateWindowSize(window.id, size)}
                  zIndex={window.zIndex}
                  initialPosition={window.position}
                  initialSize={window.size}
                />
              );
            }

            if (window.content.type === "blog") {
              return (
                <BaseWindow
                  key={window.id}
                  title={window.content.post.metadata.title}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onRestore={() => restoreWindow(window.id)}
                  onFocus={() => bringToFront(window.id)}
                  onPositionChange={(pos) =>
                    updateWindowPosition(window.id, pos)
                  }
                  onSizeChange={(size) => updateWindowSize(window.id, size)}
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
                        {window.content.post.metadata.title}
                      </h1>
                      <div
                        className="text-sm mb-6"
                        style={{ color: "#8b949e" }}
                      >
                        {new Date(
                          window.content.post.metadata.publishedAt
                        ).toLocaleDateString()}
                      </div>
                      <div className="overflow-hidden break-words">
                        <MDXContent content={window.content.post.content} />
                      </div>
                    </div>
                  </div>
                </BaseWindow>
              );
            }

            return null;
          })}
      </AnimatePresence>

      {/* Task Manager */}
      <AnimatePresence>
        {isTaskManagerOpen && (
          <TaskManagerWindow
            windows={[
              ...windows.map((w) => ({
                ...w,
                ...(w.content.type === "blog" && { post: w.content.post }),
                ...(w.content.type === "company" && {
                  companyId: w.content.companyId,
                }),
                ...(w.content.type === "finder" && {
                  finderType: w.content.finderType,
                }),
                startTime: w.startTime,
              })),
              ...(isGitHubOpen
                ? [
                    {
                      id: "system-github",
                      finderType: "GitHub",
                      isMinimized: false,
                      startTime: gitHubStartTime,
                    },
                  ]
                : []),
            ]}
            companies={companies}
            onClose={closeTaskManager}
            onFocus={() => {
              bringTaskManagerToFront();
            }}
            onCloseWindow={(windowId) => {
              if (windowId === "system-github") {
                closeGitHub();
              } else {
                closeWindow(windowId);
              }
            }}
            onMinimizeWindow={minimizeWindow}
            onRestoreWindow={restoreWindow}
            zIndex={taskManagerZIndex}
            initialPosition={{ x: 300, y: 200 }}
            initialSize={{ width: 900, height: 600 }}
          />
        )}
      </AnimatePresence>

      {/* GitHub */}
      <AnimatePresence>
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
      {windows.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-2 z-40"
          style={{ backgroundColor: "#0d1117", borderTop: "1px solid #21262d" }}
        >
          <div className="flex space-x-2">
            {windows.map((window) => {
              let title = "";

              if (window.content.type === "finder") {
                title =
                  window.content.finderType.charAt(0).toUpperCase() +
                  window.content.finderType.slice(1);
              } else if (window.content.type === "company") {
                title = companies[window.content.companyId].name;
              } else if (window.content.type === "blog") {
                const fullTitle = window.content.post.metadata.title;
                title =
                  fullTitle.length > 20
                    ? `${fullTitle.substring(0, 20)}...`
                    : fullTitle;
              }

              return (
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
                  {title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onBlogPostClick={openBlogWindow}
        onCompanyClick={openCompanyWindow}
        onFinderClick={openFinderWindow}
        onTaskManagerClick={openTaskManager}
        onGitHubClick={openGitHub}
        blogPosts={posts}
      />
    </div>
  );
}
