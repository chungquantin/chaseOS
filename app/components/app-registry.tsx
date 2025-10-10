"use client";

import {
  FileText,
  Building2,
  Video,
  FolderOpen,
  Monitor,
  Terminal,
  Github,
} from "lucide-react";

export interface App {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any> | string; // Can be either Lucide icon or image path
  color?: string;
  type: "finder" | "action";
  action?: () => void;
  finderType?: string;
}

export const apps: App[] = [
  {
    id: "blogs",
    name: "Blogs",
    description: "Browse all blog posts",
    icon: FileText,
    type: "finder",
    finderType: "blogs",
  },
  {
    id: "companies",
    name: "Companies",
    description: "View work experience",
    icon: Building2,
    type: "finder",
    finderType: "companies",
  },
  {
    id: "task-manager",
    name: "Activity Monitor",
    description: "Manage running windows and processes",
    icon: "/apps/activity-monitor.png",
    type: "action",
  },
  {
    id: "images",
    name: "Photos",
    description: "Browse and view images",
    icon: "/apps/image-gallery.png",
    type: "finder",
    finderType: "images",
  },
  {
    id: "videos",
    name: "Videos",
    description: "Edit and create videos",
    icon: "/apps/capcut.webp",
    type: "finder",
    finderType: "videos",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Browse repositories and contributions",
    icon: Github,
    type: "action",
  },
];

// Helper function to get apps by type
export const getAppsByType = (type: "finder" | "action") => {
  return apps.filter((app) => app.type === type);
};

// Helper function to get finder apps
export const getFinderApps = () => {
  return getAppsByType("finder");
};

// Helper function to get action apps
export const getActionApps = () => {
  return getAppsByType("action");
};

// Helper function to find app by ID
export const getAppById = (id: string) => {
  return apps.find((app) => app.id === id);
};
