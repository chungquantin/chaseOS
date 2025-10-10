"use client";

import { useState, useEffect } from "react";
import {
  Github,
  Star,
  GitFork,
  Eye,
  Calendar,
  Code,
  Globe,
  Lock,
  ChevronRight,
  Search,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { BaseWindow } from "./base-window";
import { GitHubButton } from "./github-button";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  updated_at: string;
  html_url: string;
  is_contributed: boolean;
  private?: boolean;
}

interface GitHubWindowProps {
  onClose: () => void;
  onFocus?: () => void;
  zIndex?: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export function GitHubWindow({
  onClose,
  onFocus,
  zIndex,
  initialPosition = { x: 200, y: 200 },
  initialSize = { width: 1000, height: 700 },
}: GitHubWindowProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "updated" | "stars" | "language"
  >("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<"all" | "owned" | "contributed">(
    "all"
  );

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/github/repositories");
      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }
      const data = await response.json();
      setRepositories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const filteredRepositories = repositories
    .filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description &&
          repo.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        filterType === "all" ||
        (filterType === "owned" && !repo.is_contributed) ||
        (filterType === "contributed" && repo.is_contributed);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "updated":
          comparison =
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "stars":
          comparison = a.stargazers_count - b.stargazers_count;
          break;
        case "language":
          comparison = (a.language || "").localeCompare(b.language || "");
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      JavaScript: "#f7df1e",
      TypeScript: "#3178c6",
      Python: "#3776ab",
      Java: "#ed8b00",
      Go: "#00add8",
      Rust: "#000000",
      C: "#a8b9cc",
      "C++": "#00599c",
      CSharp: "#239120",
      PHP: "#777bb4",
      Ruby: "#cc342d",
      Swift: "#fa7343",
      Kotlin: "#7f52ff",
      HTML: "#e34f26",
      CSS: "#1572b6",
      Shell: "#89e051",
      Dockerfile: "#384d54",
    };
    return colors[language || ""] || "#8b949e";
  };

  return (
    <BaseWindow
      title="GitHub"
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialPosition={initialPosition}
      initialSize={initialSize}
    >
      <div
        className="h-full flex flex-col"
        style={{ backgroundColor: "#0d1117" }}
      >
        {/* macOS-style Toolbar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Github size={20} style={{ color: "#f0f6fc" }} />
              <span
                className="text-lg font-semibold font-sf-pro"
                style={{ color: "#f0f6fc" }}
              >
                chungquantin
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Search size={14} style={{ color: "#8b949e" }} />
            <input
              type="text"
              placeholder="Search repositories..."
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
                  filterType === "all" ? "#21262d" : "transparent",
                color: filterType === "all" ? "#f0f6fc" : "#8b949e",
                border:
                  filterType === "all"
                    ? "1px solid #30363d"
                    : "1px solid transparent",
              }}
              onClick={() => setFilterType("all")}
              onMouseEnter={(e) => {
                if (filterType !== "all") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                  e.currentTarget.style.borderColor = "#30363d";
                }
              }}
              onMouseLeave={(e) => {
                if (filterType !== "all") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              All
            </button>
            <button
              className="px-3 py-1 rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor:
                  filterType === "owned" ? "#21262d" : "transparent",
                color: filterType === "owned" ? "#f0f6fc" : "#8b949e",
                border:
                  filterType === "owned"
                    ? "1px solid #30363d"
                    : "1px solid transparent",
              }}
              onClick={() => setFilterType("owned")}
              onMouseEnter={(e) => {
                if (filterType !== "owned") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                  e.currentTarget.style.borderColor = "#30363d";
                }
              }}
              onMouseLeave={(e) => {
                if (filterType !== "owned") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              Owned
            </button>
            <button
              className="px-3 py-1 rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor:
                  filterType === "contributed" ? "#21262d" : "transparent",
                color: filterType === "contributed" ? "#f0f6fc" : "#8b949e",
                border:
                  filterType === "contributed"
                    ? "1px solid #30363d"
                    : "1px solid transparent",
              }}
              onClick={() => setFilterType("contributed")}
              onMouseEnter={(e) => {
                if (filterType !== "contributed") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                  e.currentTarget.style.borderColor = "#30363d";
                }
              }}
              onMouseLeave={(e) => {
                if (filterType !== "contributed") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              Contributed
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div
          className="px-4 py-2 border-b"
          style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-sf-pro" style={{ color: "#8b949e" }}>
              Sort by:
            </span>
            <button
              className="px-3 py-1 flex items-center rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor:
                  sortBy === "updated" ? "#21262d" : "transparent",
                color: sortBy === "updated" ? "#f0f6fc" : "#8b949e",
                border:
                  sortBy === "updated"
                    ? "1px solid #30363d"
                    : "1px solid transparent",
              }}
              onClick={() => setSortBy("updated")}
              onMouseEnter={(e) => {
                if (sortBy !== "updated") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                  e.currentTarget.style.borderColor = "#30363d";
                }
              }}
              onMouseLeave={(e) => {
                if (sortBy !== "updated") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              <Calendar size={14} className="mr-1" />
              Updated
            </button>
            <button
              className="px-3 py-1 flex items-center rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor: sortBy === "name" ? "#21262d" : "transparent",
                color: sortBy === "name" ? "#f0f6fc" : "#8b949e",
                border:
                  sortBy === "name"
                    ? "1px solid #30363d"
                    : "1px solid transparent",
              }}
              onClick={() => setSortBy("name")}
              onMouseEnter={(e) => {
                if (sortBy !== "name") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                  e.currentTarget.style.borderColor = "#30363d";
                }
              }}
              onMouseLeave={(e) => {
                if (sortBy !== "name") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              Name
            </button>
            <button
              className="px-3 py-1 flex items-center rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor: sortBy === "stars" ? "#21262d" : "transparent",
                color: sortBy === "stars" ? "#f0f6fc" : "#8b949e",
                border:
                  sortBy === "stars"
                    ? "1px solid #30363d"
                    : "1px solid transparent",
              }}
              onClick={() => setSortBy("stars")}
              onMouseEnter={(e) => {
                if (sortBy !== "stars") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                  e.currentTarget.style.borderColor = "#30363d";
                }
              }}
              onMouseLeave={(e) => {
                if (sortBy !== "stars") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              <Star size={14} className="mr-1" />
              Stars
            </button>
            <button
              className="px-3 py-1 flex items-center rounded text-sm font-sf-pro transition-colors"
              style={{
                backgroundColor:
                  sortBy === "language" ? "#21262d" : "transparent",
                color: sortBy === "language" ? "#f0f6fc" : "#8b949e",
                border:
                  sortBy === "language"
                    ? "1px solid #30363d"
                    : "1px solid transparent",
              }}
              onClick={() => setSortBy("language")}
              onMouseEnter={(e) => {
                if (sortBy !== "language") {
                  e.currentTarget.style.backgroundColor = "#21262d";
                  e.currentTarget.style.color = "#f0f6fc";
                  e.currentTarget.style.borderColor = "#30363d";
                }
              }}
              onMouseLeave={(e) => {
                if (sortBy !== "language") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8b949e";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              <Code size={14} className="mr-1" />
              Language
            </button>
            <button
              className="px-3 py-1 flex items-center rounded text-sm font-sf-pro transition-colors ml-auto"
              style={{
                backgroundColor: "transparent",
                color: "#8b949e",
              }}
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#21262d";
                e.currentTarget.style.color = "#f0f6fc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#8b949e";
              }}
            >
              {sortOrder === "asc" ? (
                <SortAsc size={14} />
              ) : (
                <SortDesc size={14} />
              )}
            </button>
          </div>
        </div>
        {/* Repository Table Headers */}
        <div
          className="px-4 py-2 border-b"
          style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
        >
          <div
            className="flex items-center text-xs font-semibold font-sf-pro"
            style={{ color: "#8b949e" }}
          >
            <div className="w-1/3 flex items-center">
              <span>Repository</span>
            </div>
            <div className="w-20 text-center">
              <span>Language</span>
            </div>
            <div className="w-16 text-center">
              <span>Stars</span>
            </div>
            <div className="w-16 text-center">
              <span>Forks</span>
            </div>
            <div className="w-20 text-center">
              <span>Updated</span>
            </div>
            <div className="w-16 text-center">
              <span>Watchers</span>
            </div>
            <div className="w-24 text-center">
              <span>Actions</span>
            </div>
          </div>
        </div>
        <div
          className="flex-1 overflow-auto"
          style={{ backgroundColor: "#0d1117" }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                  style={{ borderColor: "#58a6ff" }}
                ></div>
                <div
                  className="text-sm font-sf-pro"
                  style={{ color: "#8b949e" }}
                >
                  Loading repositories...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-400 mb-4 font-sf-pro">{error}</div>
                <GitHubButton onClick={fetchRepositories}>Retry</GitHubButton>
              </div>
            </div>
          ) : filteredRepositories.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Github
                  size={48}
                  className="mx-auto mb-4 opacity-50"
                  style={{ color: "#8b949e" }}
                />
                <div
                  className="text-lg font-medium font-sf-pro"
                  style={{ color: "#f0f6fc" }}
                >
                  {searchQuery ? "No repositories found" : "No repositories"}
                </div>
                <div
                  className="text-sm font-sf-pro"
                  style={{ color: "#8b949e" }}
                >
                  {searchQuery
                    ? "Try a different search term"
                    : "No repositories match the current filter"}
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#21262d" }}>
              {filteredRepositories.map((repo, index) => (
                <div
                  key={repo.id}
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
                  onClick={() => window.open(repo.html_url, "_blank")}
                >
                  <div className="flex items-center text-sm text-white font-sf-pro">
                    <div className="w-1/3 flex items-center">
                      <div className="w-8 flex justify-center mr-3">
                        <Github
                          size={16}
                          className="transition-colors duration-150"
                          style={{ color: "#58a6ff" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className="font-medium whitespace-nowrap"
                            style={{ color: "#f0f6fc" }}
                          >
                            {repo.name}
                          </span>
                          {repo.private && (
                            <Lock size={12} style={{ color: "#8b949e" }} />
                          )}
                          {repo.is_contributed && (
                            <span
                              className="px-1 py-0.5 text-xs rounded font-sf-pro"
                              style={{
                                backgroundColor: "#21262d",
                                color: "#8b949e",
                              }}
                            >
                              C
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <div
                            className="text-xs truncate whitespace-nowrap mt-0.5"
                            style={{ color: "#8b949e" }}
                          >
                            {repo.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className="w-20 text-center"
                      style={{ color: "#8b949e" }}
                    >
                      {repo.language || "—"}
                    </div>
                    <div
                      className="w-16 text-center"
                      style={{ color: "#8b949e" }}
                    >
                      {repo.stargazers_count}
                    </div>
                    <div
                      className="w-16 text-center"
                      style={{ color: "#8b949e" }}
                    >
                      {repo.forks_count}
                    </div>
                    <div
                      className="w-50 text-xs text-center"
                      style={{ color: "#8b949e" }}
                    >
                      {formatDate(repo.updated_at)}
                    </div>
                    <div
                      className="w-16 text-center"
                      style={{ color: "#8b949e" }}
                    >
                      {repo.watchers_count}
                    </div>
                    <div className="w-24 flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1 rounded hover:bg-gray-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(repo.html_url, "_blank");
                        }}
                        title="Open Repository"
                      >
                        <ChevronRight size={12} style={{ color: "#8b949e" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t"
          style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
        >
          <div className="flex items-center justify-between text-sm font-sf-pro">
            <div className="flex items-center space-x-4">
              <span style={{ color: "#8b949e" }}>
                {filteredRepositories.length} of {repositories.length}{" "}
                repositories
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <GitHubButton
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open("https://github.com/chungquantin", "_blank")
                }
              >
                <Globe size={14} className="mr-1" />
                View on GitHub
              </GitHubButton>
            </div>
          </div>
        </div>
      </div>
    </BaseWindow>
  );
}
