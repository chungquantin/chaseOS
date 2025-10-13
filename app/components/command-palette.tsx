"use client";

import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Search, FileText, Building2, Video, Monitor } from "lucide-react";
import Image from "next/image";
import { BlogPost } from "../page";
import { companies } from "./company-window";
import { getFinderApps, getActionApps } from "./app-registry";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onBlogPostClick: (post: BlogPost) => void;
  onCompanyClick: (companyId: string) => void;
  onFinderClick: (finderType: string) => void;
  onTaskManagerClick: () => void;
  onGitHubClick: () => void;
  blogPosts: BlogPost[];
}

export function CommandPalette({
  isOpen,
  onClose,
  onBlogPostClick,
  onCompanyClick,
  onFinderClick,
  onTaskManagerClick,
  onGitHubClick,
  blogPosts,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-3xl mx-4">
        <Command
          className="overflow-hidden rounded-2xl shadow-2xl border-1"
          style={{
            backgroundColor: "#0d1117",
            borderColor: "#30363d",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          }}
        >
          <div
            className="flex items-center px-6 py-4 border-b"
            style={{
              backgroundColor: "#161b22",
              borderBottomColor: "#21262d",
            }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg mr-4"
              style={{ backgroundColor: "#21262d" }}
            >
              <Search size={16} className="text-gray-300" />
            </div>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search blogs, companies, videos..."
              className="flex-1 bg-transparent text-white border-none placeholder-gray-400 focus:outline-none text-lg font-sf-pro"
              autoFocus
            />
            <div className="ml-4 flex items-center space-x-2">
              <kbd className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 text-sm font-sf-mono border border-gray-700">
                ESC
              </kbd>
            </div>
          </div>

          <Command.List className="max-h-[500px] px-5 py-4 overflow-auto">
            <Command.Empty className="py-12 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#21262d" }}
                >
                  <Search size={20} className="text-gray-400" />
                </div>
                <div className="text-gray-400 text-lg font-medium">
                  No results found
                </div>
                <div className="text-gray-500 text-sm">
                  Try searching for blogs, companies, or videos
                </div>
              </div>
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="Quick Actions">
              {getFinderApps().map((app) => {
                const isImageIcon = typeof app.icon === "string";
                return (
                  <Command.Item
                    key={app.id}
                    onSelect={() => {
                      onFinderClick(app.finderType!);
                      onClose();
                    }}
                    className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 group"
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: app.color }}
                    >
                      {isImageIcon ? (
                        <Image
                          src={app.icon as string}
                          alt={app.name}
                          width={18}
                          height={18}
                          className="rounded"
                        />
                      ) : (
                        <app.icon size={18} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg font-sf-pro">
                        Open {app.name}
                      </div>
                      <div className="text-sm text-gray-400 mt-1 font-sf-pro">
                        {app.description}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-800">
                      Finder
                    </div>
                  </Command.Item>
                );
              })}

              {getActionApps().map((app) => {
                const isImageIcon = typeof app.icon === "string";
                return (
                  <Command.Item
                    key={app.id}
                    onSelect={() => {
                      if (app.id === "task-manager") {
                        onTaskManagerClick();
                      } else if (app.id === "github") {
                        onGitHubClick();
                      }
                      onClose();
                    }}
                    className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 group"
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: app.color }}
                    >
                      {isImageIcon ? (
                        <Image
                          src={app.icon as string}
                          alt={app.name}
                          width={18}
                          height={18}
                          className="rounded"
                        />
                      ) : (
                        <app.icon size={18} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">
                        {app.name}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {app.description}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-800">
                      App
                    </div>
                  </Command.Item>
                );
              })}
            </Command.Group>

            {/* Blog Posts */}
            {blogPosts.length > 0 && (
              <Command.Group heading="Blog Posts" className="py-4">
                {blogPosts.map((post) => (
                  <Command.Item
                    key={post.slug}
                    onSelect={() => {
                      onBlogPostClick(post);
                      onClose();
                    }}
                    className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    <FileText size={16} className="mr-3 text-blue-400" />
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {post.metadata.title}
                      </div>
                      <div className="text-sm text-gray-400 line-clamp-2">
                        {post.metadata.summary}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(
                          post.metadata.publishedAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Companies */}
            <Command.Group heading="Companies" className="py-4">
              {Object.entries(companies).map(([id, company]) => (
                <Command.Item
                  key={id}
                  onSelect={() => {
                    onCompanyClick(id);
                    onClose();
                  }}
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <Building2 size={16} className="mr-3 text-green-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">{company.name}</div>
                    <div className="text-sm text-gray-400 line-clamp-2">
                      {company.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {company.duration}
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Videos */}
            <Command.Group heading="Videos" className="py-4">
              <Command.Item
                onSelect={() => {
                  console.log("Opening intro video");
                  onClose();
                }}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <Video size={16} className="mr-3 text-purple-400" />
                <div className="flex-1">
                  <div className="text-white font-medium">
                    Introduction Video
                  </div>
                  <div className="text-sm text-gray-400">
                    Personal introduction and background
                  </div>
                  <div className="text-xs text-gray-500 mt-1">2024-01-15</div>
                </div>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  console.log("Opening tech talk video");
                  onClose();
                }}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <Video size={16} className="mr-3 text-purple-400" />
                <div className="flex-1">
                  <div className="text-white font-medium">
                    Blockchain Technology Talk
                  </div>
                  <div className="text-sm text-gray-400">
                    Technical presentation on blockchain development
                  </div>
                  <div className="text-xs text-gray-500 mt-1">2023-12-10</div>
                </div>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  console.log("Opening tutorial series");
                  onClose();
                }}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <Video size={16} className="mr-3 text-purple-400" />
                <div className="flex-1">
                  <div className="text-white font-medium">
                    Rust Development Tutorial
                  </div>
                  <div className="text-sm text-gray-400">
                    Complete Rust programming tutorial series
                  </div>
                  <div className="text-xs text-gray-500 mt-1">2023-11-22</div>
                </div>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
