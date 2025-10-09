"use client";

import { useState, useEffect } from "react";
import { BlogPosts } from "app/components/posts";
import { Window } from "app/components/window";

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

export default function Page() {
  const [windows, setWindows] = useState<WindowState[]>([]);
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

  return (
    <div className="relative min-h-screen">
      {/* ChaseOS Status Bar */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-50">
        <div className="flex items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center space-x-4">
            <div className="text-white font-semibold">ChaseOS</div>
            <div className="text-gray-400">chungtin.eth</div>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
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
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 desktop-bg -z-10" />

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
        <div className="my-8">
          <BlogPosts onPostClick={openWindow} posts={posts} />
        </div>
      </section>

      {/* Windows */}
      {windows
        .filter((window) => !window.isMinimized)
        .map((window) => (
          <Window
            key={window.id}
            post={window.post}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onRestore={() => restoreWindow(window.id)}
            initialPosition={window.position}
            initialSize={window.size}
          />
        ))}

      {/* Taskbar */}
      {windows.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-2 z-40">
          <div className="flex space-x-2">
            {windows.map((window) => (
              <button
                key={window.id}
                onClick={() =>
                  window.isMinimized
                    ? restoreWindow(window.id)
                    : bringToFront(window.id)
                }
                className={`px-3 py-1 text-xs rounded border transition-colors ${
                  window.isMinimized
                    ? "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
                    : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                }`}
              >
                {window.post.metadata.title.length > 20
                  ? `${window.post.metadata.title.substring(0, 20)}...`
                  : window.post.metadata.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
