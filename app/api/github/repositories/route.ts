import { NextResponse } from "next/server";

export async function GET() {
  try {
    const username = "chungquantin";

    // Fetch user's repositories (owned)
    const ownedReposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ChaseOS-Portfolio",
        },
      }
    );

    if (!ownedReposResponse.ok) {
      throw new Error(`GitHub API error: ${ownedReposResponse.status}`);
    }

    const ownedRepos = await ownedReposResponse.json();

    // Fetch user's contributed repositories (events)
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ChaseOS-Portfolio",
        },
      }
    );

    let contributedRepos: any[] = [];
    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      const contributedRepoMap = new Map();

      events.forEach((event: any) => {
        if (event.repo && event.type === "PushEvent") {
          const repoFullName = event.repo.name; // This is already in "owner/repo" format
          if (!contributedRepoMap.has(repoFullName)) {
            contributedRepoMap.set(repoFullName, {
              id: event.repo.id,
              name: event.repo.name.split("/")[1], // Extract just the repo name
              full_name: event.repo.name,
              description: null,
              language: null,
              stargazers_count: 0,
              forks_count: 0,
              updated_at: event.created_at,
              html_url: `https://github.com/${event.repo.name}`,
              is_contributed: true,
            });
          }
        }
      });

      contributedRepos = Array.from(contributedRepoMap.values());
    }

    // Combine and deduplicate repositories
    const repoMap = new Map();

    // Add owned repositories first
    ownedRepos.forEach((repo: any) => {
      repoMap.set(repo.full_name, {
        ...repo,
        is_contributed: false,
      });
    });

    // Add contributed repositories (only if not already owned)
    contributedRepos.forEach((repo: any) => {
      if (!repoMap.has(repo.full_name)) {
        repoMap.set(repo.full_name, repo);
      }
    });

    const uniqueRepos = Array.from(repoMap.values());

    // Sort by updated date
    uniqueRepos.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return NextResponse.json(uniqueRepos);
  } catch (error) {
    console.error("GitHub API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
