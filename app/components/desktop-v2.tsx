"use client";

import { useState } from "react";
import Image from "next/image";
import { getFinderApps, getActionApps } from "./app-registry";

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

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
  onTaskManagerClick: () => void;
  onGitHubClick: () => void;
}

export function Desktop({
  onFinderClick,
  onTaskManagerClick,
  onGitHubClick,
}: DesktopProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  // Create desktop apps from registry
  const finderApps = getFinderApps().map((app) => ({
    id: `${app.id}-finder`,
    name: app.name,
    icon: app.icon,
    type: "finder" as const,
    color: app.color,
    onClick: () => onFinderClick(app.finderType!),
  }));

  const actionApps = getActionApps().map((app) => ({
    id: app.id,
    name: app.name,
    icon: app.icon,
    type: "app" as const,
    color: app.color,
    onClick: () => {
      if (app.id === "task-manager") {
        onTaskManagerClick();
      } else if (app.id === "github") {
        onGitHubClick();
      }
    },
  }));

  const desktopApps: DesktopApp[] = [...finderApps, ...actionApps] as any;

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
          const isImageIcon = typeof app.icon === "string";
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
                  background: isImageIcon
                    ? "transparent"
                    : app.color
                    ? `linear-gradient(145deg, ${app.color}, ${adjustColor(
                        app.color,
                        -20
                      )})`
                    : `linear-gradient(145deg, #1a1a1a, #2a2a2a)`,
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
                {isImageIcon ? (
                  <Image
                    src={app.icon as any}
                    alt={app.name}
                    width={50}
                    height={50}
                    className="relative z-10 rounded"
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                    }}
                  />
                ) : (
                  <app.icon
                    size={25}
                    className="relative z-10"
                    style={{
                      color: app.color ? "white" : "white",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                    }}
                  />
                )}

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
                    text-xs font-medium px-2 py-1 rounded-md
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
