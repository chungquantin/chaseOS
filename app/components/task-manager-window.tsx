"use client";

import { useState, useEffect } from "react";
import {
  Monitor,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Clock,
  MemoryStick,
  Activity,
  FileText,
  Building2,
  Video,
  FolderOpen,
  Search,
  Info,
  Square,
  Settings,
  Grid3X3,
} from "lucide-react";
import { BaseWindow } from "./base-window";

interface WindowProcess {
  id: string;
  name: string;
  type: "blog" | "company" | "finder";
  memoryUsage: number; // MB
  startTime: number; // timestamp when window was opened
  isMinimized: boolean;
  icon: React.ComponentType<any>;
}

interface TaskManagerWindowProps {
  windows: Array<{
    id: string;
    post?: { metadata: { title: string } };
    companyId?: string;
    finderType?: string;
    isMinimized: boolean;
    startTime?: number; // timestamp when window was opened
  }>;
  companies: Record<string, { name: string }>;
  onClose: () => void;
  onFocus?: () => void;
  onCloseWindow: (windowId: string) => void;
  onMinimizeWindow: (windowId: string) => void;
  onRestoreWindow: (windowId: string) => void;
  zIndex?: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export function TaskManagerWindow({
  windows,
  companies,
  onClose,
  onFocus,
  onCloseWindow,
  onMinimizeWindow,
  onRestoreWindow,
  zIndex,
  initialPosition = { x: 200, y: 200 },
  initialSize = { width: 900, height: 600 },
}: TaskManagerWindowProps) {
  const [processes, setProcesses] = useState<WindowProcess[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "memory" | "runtime" | "cpu">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<
    "cpu" | "memory" | "energy" | "disk" | "network"
  >("cpu");
  const [searchQuery, setSearchQuery] = useState("");

  // Generate processes from windows
  useEffect(() => {
    const newProcesses: WindowProcess[] = windows.map((window) => {
      let name = "Unknown Window";
      let type: "blog" | "company" | "finder" = "finder";
      let icon = FolderOpen;

      if (window.post) {
        name = window.post.metadata.title;
        type = "blog";
        icon = FileText;
      } else if (window.companyId) {
        name = companies[window.companyId]?.name || "Unknown Company";
        type = "company";
        icon = Building2;
      } else if (window.finderType) {
        name = `${
          window.finderType.charAt(0).toUpperCase() + window.finderType.slice(1)
        } Finder`;
        type = "finder";
        icon = FolderOpen;
      }

      // Simulate memory usage based on window type and content
      const baseMemory = type === "blog" ? 45 : type === "company" ? 35 : 25;
      const randomVariation = Math.floor(Math.random() * 20) - 10;
      const memoryUsage = Math.max(10, baseMemory + randomVariation);

      // Use actual start time or current time if not provided
      const startTime = window.startTime || Date.now();

      return {
        id: window.id,
        name,
        type,
        memoryUsage,
        startTime,
        isMinimized: window.isMinimized,
        icon,
      };
    });

    setProcesses(newProcesses);
  }, [windows, companies]);

  // Update runtime every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update runtime display
      setProcesses((prev) => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sort processes
  const sortedProcesses = [...processes].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "memory":
        comparison = a.memoryUsage - b.memoryUsage;
        break;
      case "runtime":
        const runtimeA = Math.floor((Date.now() - a.startTime) / 1000);
        const runtimeB = Math.floor((Date.now() - b.startTime) / 1000);
        comparison = runtimeA - runtimeB;
        break;
      case "cpu":
        // Simulate CPU usage for sorting
        const cpuA = Math.random() * 5;
        const cpuB = Math.random() * 5;
        comparison = cpuA - cpuB;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Filter processes based on search query
  const filteredProcesses = sortedProcesses.filter((process) =>
    process.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRuntime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else if (minutes > 0) {
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${secs}s`;
    }
  };

  const totalMemory = processes.reduce(
    (sum, process) => sum + process.memoryUsage,
    0
  );
  const totalProcesses = processes.length;

  return (
    <BaseWindow
      title="Activity Monitor"
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialPosition={initialPosition}
      initialSize={initialSize}
    >
      <div className="h-full flex flex-col bg-gray-900">
        {/* macOS-style Toolbar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Info
                size={16}
                className="cursor-pointer transition-colors"
                style={{ color: "#8b949e" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f0f6fc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8b949e";
                }}
              />
              <Square
                size={16}
                className="cursor-pointer transition-colors"
                style={{ color: "#8b949e" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f0f6fc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8b949e";
                }}
              />
              <Search
                size={16}
                className="cursor-pointer transition-colors"
                style={{ color: "#8b949e" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f0f6fc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8b949e";
                }}
              />
              <Settings
                size={16}
                className="cursor-pointer transition-colors"
                style={{ color: "#8b949e" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f0f6fc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8b949e";
                }}
              />
              <Grid3X3
                size={16}
                className="cursor-pointer transition-colors"
                style={{ color: "#8b949e" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f0f6fc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8b949e";
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Search size={14} style={{ color: "#8b949e" }} />
            <input
              type="text"
              placeholder="Search processes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm border-none outline-none font-sf-pro w-40"
              style={{ color: "#f0f6fc" }}
            />
          </div>
        </div>

        {/* macOS-style Tab Bar */}
        <div
          className="flex items-center px-4 py-2 border-b"
          style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
        >
          <div className="flex space-x-1">
            <button
              className="px-3 py-1 rounded text-sm font-sf-pro font-medium transition-colors"
              style={{
                backgroundColor:
                  activeTab === "cpu" ? "#3fb950" : "transparent",
                color: activeTab === "cpu" ? "#ffffff" : "#8b949e",
              }}
              onClick={() => setActiveTab("cpu")}
              onMouseEnter={(e) => {
                if (activeTab !== "cpu") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "cpu") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                }
              }}
            >
              CPU
            </button>
            <button
              className="px-3 py-1 rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor:
                  activeTab === "memory" ? "#3fb950" : "transparent",
                color: activeTab === "memory" ? "#ffffff" : "#8b949e",
              }}
              onClick={() => setActiveTab("memory")}
              onMouseEnter={(e) => {
                if (activeTab !== "memory") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "memory") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                }
              }}
            >
              Memory
            </button>
            <button
              className="px-3 py-1 rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor:
                  activeTab === "energy" ? "#3fb950" : "transparent",
                color: activeTab === "energy" ? "#ffffff" : "#8b949e",
              }}
              onClick={() => setActiveTab("energy")}
              onMouseEnter={(e) => {
                if (activeTab !== "energy") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "energy") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                }
              }}
            >
              Energy
            </button>
            <button
              className="px-3 py-1 rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor:
                  activeTab === "disk" ? "#3fb950" : "transparent",
                color: activeTab === "disk" ? "#ffffff" : "#8b949e",
              }}
              onClick={() => setActiveTab("disk")}
              onMouseEnter={(e) => {
                if (activeTab !== "disk") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "disk") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                }
              }}
            >
              Disk
            </button>
            <button
              className="px-3 py-1 rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor:
                  activeTab === "network" ? "#3fb950" : "transparent",
                color: activeTab === "network" ? "#ffffff" : "#8b949e",
              }}
              onClick={() => setActiveTab("network")}
              onMouseEnter={(e) => {
                if (activeTab !== "network") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "network") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                }
              }}
            >
              Network
            </button>
          </div>
        </div>

        {/* Process Table Headers */}
        <div
          className="px-4 py-2 border-b"
          style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
        >
          <div
            className="flex items-center text-xs font-semibold font-sf-pro"
            style={{ color: "#8b949e" }}
          >
            <div
              className="w-1/3 flex items-center cursor-pointer"
              style={{ color: "#8b949e" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f0f6fc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#8b949e";
              }}
              onClick={() => {
                if (sortBy === "name") {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("name");
                  setSortOrder("asc");
                }
              }}
            >
              <span>Process...</span>
              <span className="ml-1" style={{ color: "#6e7681" }}>
                {sortBy === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↓"}
              </span>
            </div>
            <div
              className="w-16 text-center cursor-pointer"
              style={{ color: "#8b949e" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f0f6fc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#8b949e";
              }}
              onClick={() => {
                if (sortBy === "cpu") {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("cpu");
                  setSortOrder("asc");
                }
              }}
            >
              <span>% CPU</span>
              <span className="ml-1" style={{ color: "#6e7681" }}>
                {sortBy === "cpu" ? (sortOrder === "asc" ? "↑" : "↓") : "↓"}
              </span>
            </div>
            <div
              className="w-20 text-center cursor-pointer"
              style={{ color: "#8b949e" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f0f6fc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#8b949e";
              }}
              onClick={() => {
                if (sortBy === "runtime") {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("runtime");
                  setSortOrder("asc");
                }
              }}
            >
              <span>CPU Time</span>
              <span className="ml-1" style={{ color: "#6e7681" }}>
                {sortBy === "runtime" ? (sortOrder === "asc" ? "↑" : "↓") : "↓"}
              </span>
            </div>
            <div className="w-16 text-center">Threads</div>
            <div className="w-20 text-center">Idle Wake Ups</div>
            <div className="w-16 text-center">Kind</div>
            <div className="w-16 text-center">% GPU</div>
            <div className="w-20 text-center">GPU Time</div>
            <div className="w-16 text-center">PID</div>
            <div className="w-20 text-center">User</div>
          </div>
        </div>

        {/* Process List */}
        <div
          className="flex-1 overflow-auto"
          style={{ backgroundColor: "#0d1117" }}
        >
          {filteredProcesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-gray-400 font-sf-pro">
              <Monitor size={48} className="mb-4 opacity-50" />
              <div className="text-lg font-medium">
                {searchQuery ? "No processes found" : "No processes running"}
              </div>
              <div className="text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Open some windows to see them here"}
              </div>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#21262d" }}>
              {filteredProcesses.map((process, index) => {
                const IconComponent = process.icon;
                const runtime = Math.floor(
                  (Date.now() - process.startTime) / 1000
                );
                const cpuUsage = Math.random() * 5; // Simulate CPU usage
                const threads = Math.floor(Math.random() * 20) + 1;
                const idleWakeUps = Math.floor(Math.random() * 100);
                const gpuUsage = Math.random() * 2;
                const pid = 1000 + index;
                const user =
                  process.type === "blog"
                    ? "chungtin"
                    : process.type === "company"
                    ? "system"
                    : "finder";

                return (
                  <div
                    key={process.id}
                    className="px-4 py-1.5 transition-colors cursor-pointer border-l-2 border-transparent hover:border-blue-500 group"
                    style={{
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#21262d";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div className="flex items-center text-sm text-white font-sf-pro">
                      <div className="w-1/3 flex items-center">
                        <div className="w-8 flex justify-center mr-3">
                          <IconComponent
                            size={16}
                            className="transition-colors duration-150"
                            style={{ color: "#58a6ff" }}
                          />
                        </div>
                        <span
                          className="truncate font-medium"
                          style={{ color: "#f0f6fc" }}
                        >
                          {process.name}
                        </span>
                      </div>
                      <div
                        className="w-16 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        {cpuUsage.toFixed(1)}%
                      </div>
                      <div
                        className="w-20 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        {formatRuntime(runtime)}
                      </div>
                      <div
                        className="w-16 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        {threads}
                      </div>
                      <div
                        className="w-20 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        {idleWakeUps}
                      </div>
                      <div
                        className="w-16 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        Intel
                      </div>
                      <div
                        className="w-16 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        {gpuUsage.toFixed(1)}%
                      </div>
                      <div
                        className="w-20 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        {formatRuntime(Math.floor(runtime * 0.3))}
                      </div>
                      <div
                        className="w-16 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        {pid}
                      </div>
                      <div
                        className="w-20 text-center"
                        style={{ color: "#8b949e" }}
                      >
                        {user}
                      </div>
                      <div className="w-24 flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1 rounded hover:bg-gray-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (process.isMinimized) {
                              onRestoreWindow(process.id);
                            } else {
                              onMinimizeWindow(process.id);
                            }
                          }}
                          title={process.isMinimized ? "Restore" : "Minimize"}
                        >
                          {process.isMinimized ? (
                            <Maximize2 size={12} style={{ color: "#8b949e" }} />
                          ) : (
                            <Minimize2 size={12} style={{ color: "#8b949e" }} />
                          )}
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloseWindow(process.id);
                          }}
                          title="Close"
                        >
                          <X size={12} style={{ color: "#f85149" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BaseWindow>
  );
}
