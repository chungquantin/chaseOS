"use client";

import { useState } from "react";
import { FolderOpen, Building2, Video } from "lucide-react";

interface DesktopApp {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  type: "finder" | "company" | "blog" | "app";
  color?: string;
  onClick: () => void;
}

interface DesktopProps {
  onBlogPostClick: (post: any) => void;
  onCompanyClick: (companyId: string) => void;
  onFinderClick: (finderType: string) => void;
  blogPosts: any[];
}

export function Desktop({
  onCompanyClick,
  onFinderClick,
  blogPosts,
}: DesktopProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  // Create desktop apps with better icon designs
  const desktopApps: DesktopApp[] = [
    // Finder Apps
    {
      id: "blogs-finder",
      name: "Blogs",
      icon: FolderOpen,
      type: "finder",
      onClick: () => onFinderClick("blogs"),
    },
    {
      id: "companies-finder",
      name: "Companies",
      icon: Building2,
      type: "finder",
      onClick: () => onFinderClick("companies"),
    },
    {
      id: "videos-finder",
      name: "Videos",
      icon: Video,
      type: "finder",
      onClick: () => onFinderClick("videos"),
    },
  ];

  const handleAppClick = (app: DesktopApp) => {
    setSelectedApp(app.id);
    setTimeout(() => setSelectedApp(null), 200);
    app.onClick();
  };

  return (
    <div className="inset-0 py-8">
      {/* Desktop Grid */}
      <div className="flex flex-row gap-8 h-full">
        {desktopApps.map((app) => {
          const IconComponent = app.icon;
          return (
            <div
              key={app.id}
              className="flex flex-col items-center justify-center cursor-pointer group"
              onClick={() => handleAppClick(app)}
            >
              {/* App Icon with macOS-style design */}
              <div
                className={`
                  rounded-2xl flex items-center justify-center mb-3
                  transition-all duration-300 ease-out relative overflow-hidden cursor-pointer
                  ${selectedApp === app.id ? "scale-110" : "hover:scale-105"}
                `}
                style={{
                  width: "50px",
                  height: "50px",
                  background: `linear-gradient(145deg, #1a1a1a, #2a2a2a)`,
                  boxShadow:
                    selectedApp === app.id
                      ? `0 20px 40px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
                      : `0 8px 24px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
                  border: `1px solid rgba(255,255,255,0.05)`,
                }}
                onMouseEnter={(e) => {
                  if (selectedApp !== app.id) {
                    e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.6), 0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)`;
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedApp !== app.id) {
                    e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`;
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                {/* Inner highlight for depth */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-20"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.15), transparent 50%)",
                  }}
                />

                {/* Icon with proper styling */}
                <IconComponent
                  size={25}
                  className="relative z-10"
                  style={{
                    color: "white",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                  }}
                />

                {/* Bottom shadow for depth */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl opacity-15"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
                  }}
                />
              </div>

              {/* App Name with macOS-style styling */}
              <div className="text-center">
                <div
                  className={`
                    text-sm font-medium px-2 py-1 rounded-md
                    transition-all duration-300
                    ${
                      selectedApp === app.id
                        ? "text-white"
                        : "text-gray-200 group-hover:text-white"
                    }
                  `}
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    fontWeight: "500",
                  }}
                >
                  {app.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
