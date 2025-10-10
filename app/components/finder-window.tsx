"use client";

import { useState } from "react";
import {
  FileText,
  Folder,
  Video,
  Building2,
  Calendar,
  User,
  ArrowLeft,
  Grid3X3,
  List,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { BaseWindow } from "./base-window";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  icon: React.ComponentType<any>;
  size?: string;
  modified: string;
  description?: string;
  onClick: () => void;
  children?: FileItem[];
}

interface FinderWindowProps {
  title: string;
  items: FileItem[];
  onClose: () => void;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  zIndex?: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export function FinderWindow({
  title,
  items,
  onClose,
  onMinimize,
  onRestore,
  onFocus,
  zIndex,
  initialPosition = { x: 200, y: 200 },
  initialSize = { width: 800, height: 600 },
}: FinderWindowProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPath, setCurrentPath] = useState<string[]>(["ChaseOS"]);
  const [currentItems, setCurrentItems] = useState<FileItem[]>(items);

  const filteredItems = currentItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigateToFolder = (folderName: string) => {
    const folder = currentItems.find(
      (item) => item.name === folderName && item.type === "folder"
    );
    if (folder && folder.children) {
      setCurrentPath([...currentPath, folderName]);
      setCurrentItems(folder.children);
    }
  };

  const navigateBack = () => {
    if (currentPath.length > 1) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);

      // Navigate back to parent items
      if (newPath.length === 1) {
        setCurrentItems(items);
      } else {
        // Find parent folder and set its children
        let parentItems = items;
        for (let i = 1; i < newPath.length; i++) {
          const parentFolder = parentItems.find(
            (item) => item.name === newPath[i] && item.type === "folder"
          );
          if (parentFolder && parentFolder.children) {
            parentItems = parentFolder.children;
          }
        }
        setCurrentItems(parentItems);
      }
    }
  };

  return (
    <BaseWindow
      title={title}
      onClose={onClose}
      onMinimize={onMinimize}
      onRestore={onRestore}
      onFocus={onFocus}
      zIndex={zIndex}
      initialPosition={initialPosition}
      initialSize={initialSize}
    >
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div
          className="px-4 py-2 flex items-center justify-between border-b flex-shrink-0"
          style={{
            backgroundColor: "#161b22",
            borderBottom: "1px solid #21262d",
          }}
        >
          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-md transition-all duration-150 hover:bg-gray-700"
              onClick={navigateBack}
              disabled={currentPath.length <= 1}
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#21262d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <ArrowLeft
                size={16}
                style={{
                  color: currentPath.length <= 1 ? "#6e7681" : "#8b949e",
                }}
              />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-1 ml-4">
              {currentPath.map((path, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-500">/</span>}
                  <button
                    className="text-sm hover:text-blue-400 transition-colors"
                    onClick={() => {
                      if (index < currentPath.length - 1) {
                        // Navigate to this level
                        const newPath = currentPath.slice(0, index + 1);
                        setCurrentPath(newPath);

                        if (newPath.length === 1) {
                          setCurrentItems(items);
                        } else {
                          // Find the correct items for this path
                          let targetItems = items;
                          for (let i = 1; i < newPath.length; i++) {
                            const folder = targetItems.find(
                              (item) =>
                                item.name === newPath[i] &&
                                item.type === "folder"
                            );
                            if (folder && folder.children) {
                              targetItems = folder.children;
                            }
                          }
                          setCurrentItems(targetItems);
                        }
                      }
                    }}
                    style={{
                      color:
                        index === currentPath.length - 1
                          ? "#f0f6fc"
                          : "#8b949e",
                    }}
                  >
                    {path}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-1">
              <button
                className={`p-2 rounded-md transition-all duration-150 ${
                  viewMode === "list" ? "bg-gray-700" : ""
                }`}
                onClick={() => setViewMode("list")}
                style={{
                  backgroundColor:
                    viewMode === "list" ? "#21262d" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== "list") {
                    e.currentTarget.style.backgroundColor = "#21262d";
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== "list") {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <List size={16} style={{ color: "#8b949e" }} />
              </button>
              <button
                className={`p-2 rounded-md transition-all duration-150 ${
                  viewMode === "grid" ? "bg-gray-700" : ""
                }`}
                onClick={() => setViewMode("grid")}
                style={{
                  backgroundColor:
                    viewMode === "grid" ? "#21262d" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== "grid") {
                    e.currentTarget.style.backgroundColor = "#21262d";
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== "grid") {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <Grid3X3 size={16} style={{ color: "#8b949e" }} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: "#8b949e" }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm rounded-md border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: "#0d1117",
                  borderColor: "#21262d",
                  color: "#f0f6fc",
                  width: "200px",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#58a6ff";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(88, 166, 255, 0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#21262d";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
            <button
              className="p-2 rounded-md transition-all duration-150"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#21262d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <MoreHorizontal size={16} style={{ color: "#8b949e" }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === "list" ? (
            <div className="space-y-1">
              {/* List Header */}
              <div
                className="flex items-center px-2 py-1 text-xs font-medium"
                style={{ color: "#8b949e" }}
              >
                <div className="w-8"></div>
                <div className="flex-1">Name</div>
                <div className="w-24">Size</div>
                <div className="w-32">Modified</div>
              </div>

              {/* List Items */}
              {filteredItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center px-3 py-2 rounded-md cursor-pointer group transition-all duration-150 ease-out"
                    onClick={() => {
                      if (item.type === "folder") {
                        navigateToFolder(item.name);
                      } else {
                        item.onClick();
                      }
                    }}
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
                    <div className="w-8 flex justify-center">
                      <IconComponent
                        size={16}
                        className="transition-colors duration-150"
                        style={{ color: "#58a6ff" }}
                      />
                    </div>
                    <div
                      className="flex-1 text-sm font-medium"
                      style={{ color: "#f0f6fc" }}
                    >
                      {item.name}
                    </div>
                    <div className="w-24 text-xs" style={{ color: "#8b949e" }}>
                      {item.size || "-"}
                    </div>
                    <div className="w-32 text-xs" style={{ color: "#8b949e" }}>
                      {item.modified}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-4">
              {filteredItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-center p-4 rounded-lg cursor-pointer group transition-all duration-200 ease-out"
                    onClick={() => {
                      if (item.type === "folder") {
                        navigateToFolder(item.name);
                      } else {
                        item.onClick();
                      }
                    }}
                    style={{
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#21262d";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all duration-200"
                      style={{
                        backgroundColor: "#161b22",
                        border: "1px solid #21262d",
                      }}
                    >
                      <IconComponent
                        size={28}
                        className="transition-all duration-200"
                        style={{ color: "#58a6ff" }}
                      />
                    </div>
                    <div
                      className="text-xs text-center font-medium leading-tight"
                      style={{ color: "#f0f6fc" }}
                    >
                      {item.name}
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
