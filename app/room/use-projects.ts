"use client";

import { useEffect, useState } from "react";
import { pickProjects, type Project } from "app/data/projects";

type State = { status: "loading" | "ready" | "error"; projects: Project[] };

let cache: Promise<Project[]> | null = null;

function load() {
  cache ??= fetch("/api/github/repositories")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((raw) => (Array.isArray(raw) ? pickProjects(raw) : []))
    .catch((e) => {
      cache = null; // allow a retry on next mount
      throw e;
    });
  return cache;
}

/** Repos for the project case, fetched once and shared. */
export function useProjects(): State {
  const [state, setState] = useState<State>({ status: "loading", projects: [] });
  useEffect(() => {
    let alive = true;
    load()
      .then((projects) => alive && setState({ status: "ready", projects }))
      .catch(() => alive && setState({ status: "error", projects: [] }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
