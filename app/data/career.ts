/**
 * Career chapters, in chronological order. Each one is rendered as a symbolic
 * object in the room (see app/room/scene/chapters.tsx) and opens a chapter
 * panel. Source: CV page 1 (Rover, R0GUE, Amazely, Snowflake) and the
 * homepage work index (Architect, Polkadot, OpenGuild).
 */

export type ChapterId =
  | "snowflake"
  | "amazely"
  | "openguild"
  | "polkadot"
  | "rogue"
  | "rover"
  | "architect";

export type Chapter = {
  id: ChapterId;
  company: string;
  role: string;
  period: string;
  /** first year, used for labels */
  year: string;
  location?: string;
  href: string;
  founding?: boolean;
  summary: string;
  bullets: string[];
  metrics: { value: string; label: string }[];
  stack: string[];
  /** the object that represents this chapter in the room */
  symbol: { name: string; why: string };
  /** researched company background (from the company's own site) */
  org: {
    logo?: string;
    /** fallback tile when there's no logo */
    monogram?: string;
    brand: string;
    website?: string;
    oneLiner: string;
    facts: string[];
  };
  /** what I built there, as a left-to-right flow for the diagram */
  built?: { title: string; flow: { label: string; note?: string }[] };
  /** more products from the same job, each drawn as its own flow */
  alsoBuilt?: { title: string; flow: { label: string; note?: string }[] }[];
};

export const chapters: Chapter[] = [
  {
    id: "snowflake",
    company: "Snowflake Network",
    role: "Software Engineer",
    period: "Feb 2022 – Dec 2022",
    year: "2022",
    location: "Ho Chi Minh City, Vietnam",
    href: "https://www.linkedin.com/in/chungquantin/",
    summary:
      "On-chain automation and the node infrastructure that keeps it alive.",
    bullets: [
      "Designed and deployed secure on-chain automation protocols in Rust, using the Anchor framework to handle multi-signature logic and automated asset management.",
      "Built a resilient node operator monitoring system, achieving 99.9% uptime for high-stakes transaction execution through automated health checks and failover scripts.",
      "Profiled RPC client implementations in depth, finding and fixing memory leaks that cut service overhead and infrastructure costs by 30%.",
    ],
    metrics: [
      { value: "99.9%", label: "node uptime" },
      { value: "−30%", label: "infra cost" },
    ],
    stack: ["Rust", "Anchor", "Multisig", "RPC", "React.js"],
    org: {
      logo: "/logos/snowflake.svg",
      brand: "#7c3aed",
      website: "https://snowflake.so",
      oneLiner: "Institutional-grade multisig wallet and on-chain automation for Solana.",
      facts: [
        "Two products: Snowflake Safe (multisig) and Snowflake Automation",
        "Used by teams such as Pyth, Lido, Everstake and Zeta",
        "Wound down on 31 Oct 2023",
      ],
    },
    built: {
      title: "Multisig + automation on Solana",
      flow: [
        { label: "Teams & DAOs", note: "multisig owners" },
        { label: "Anchor programs", note: "multisig logic" },
        { label: "Automation jobs", note: "asset management" },
        { label: "Node monitor", note: "99.9% uptime" },
      ],
    },
    symbol: {
      name: "The snow globe",
      why: "A tiny node sealed in glass, LED still blinking green while the storm swirls around it. 99.9% uptime, whatever the weather.",
    },
  },
  {
    id: "amazely",
    company: "Amazely",
    role: "Founding Software Engineer",
    period: "Jan 2023 – Jul 2024",
    year: "2023",
    location: "Ho Chi Minh City, Vietnam",
    href: "https://www.linkedin.com/in/chungquantin/",
    founding: true,
    summary:
      "Built the backend from zero: from MVP to 1,200+ businesses, streaming AI-generated content in real time.",
    bullets: [
      "Architected a scalable microservices backend from the ground up, supporting growth from MVP to 1,200+ businesses.",
      "Engineered a distributed task-scheduling engine on Redis and Node.js managing 20+ concurrent background workers with retries and fault tolerance.",
      "Developed real-time streaming APIs delivering AI-generated content over WebSocket event streams for a low-latency, interactive experience.",
      "Established CI/CD practices and Dockerized the entire service mesh, reducing MTTR and simplifying local development.",
    ],
    metrics: [
      { value: "1,200+", label: "businesses" },
      { value: "20+", label: "concurrent workers" },
    ],
    stack: ["Node.js", "Redis", "WebSockets", "Docker", "CI/CD", "AI streaming"],
    org: {
      logo: "/logos/amazely.png",
      brand: "#7e22ce",
      website: "https://amazely.co",
      oneLiner: "All-in-one, AI-assisted reputation marketing software for local businesses.",
      facts: [
        "Review management, social posting and automated blogs",
        "Integrations with Square, Google and Meta",
        "AI drafts marketing plans and runs them on approval",
      ],
    },
    built: {
      title: "Backend from MVP to scale",
      flow: [
        { label: "Businesses", note: "1,200+" },
        { label: "Microservices", note: "built from zero" },
        { label: "Task scheduler", note: "Redis · 20+ workers" },
        { label: "AI generation", note: "content" },
        { label: "WebSocket stream", note: "real-time UX" },
      ],
    },
    symbol: {
      name: "The inference rack",
      why: "GPUs humming, worker LEDs blinking, tokens streaming out of the hologram one by one. The AI-content engine, built from an empty repo.",
    },
  },
  {
    id: "openguild",
    company: "OpenGuild",
    role: "Co-Founder",
    period: "2023 – 2026",
    year: "2023",
    href: "https://github.com/openguild-labs",
    founding: true,
    summary: "A Southeast Asia developer community for Polkadot builders.",
    bullets: [],
    metrics: [],
    stack: ["Community", "Education", "Polkadot"],
    org: {
      logo: "/logos/openguild.png",
      brand: "#4c1d95",
      website: "https://openguild.wtf",
      oneLiner: "An open community of Web3 builders elevating Polkadot.",
      facts: [
        "Builders across Vietnam, the Philippines, Malaysia, Thailand and Singapore",
        "Core contributor to Polkadot APAC",
        "Runs CODECAMP, challenges, events and a public handbook",
      ],
    },
    built: {
      title: "A builder pipeline for SEA",
      flow: [
        { label: "Learn", note: "handbook & courses" },
        { label: "CODECAMP", note: "challenges" },
        { label: "Build", note: "first projects" },
        { label: "Contribute", note: "open source" },
      ],
    },
    symbol: {
      name: "The guild banner",
      why: "A guild is people who teach each other a craft. This one flies over Southeast Asia.",
    },
  },
  {
    id: "polkadot",
    company: "Polkadot",
    role: "SEA Developer Relations Lead",
    period: "2024 – 2026",
    year: "2024",
    href: "https://polkadot.network/",
    summary:
      "Developer education, workshops, ecosystem programs and public technical sharing across Southeast Asia.",
    bullets: [],
    metrics: [],
    stack: ["DevRel", "Workshops", "Substrate", "Rust"],
    org: {
      logo: "/logos/polkadot.svg",
      brand: "#e6007a",
      website: "https://polkadot.com",
      oneLiner: "A multichain network: many specialised chains sharing one relay chain's security.",
      facts: [
        "Built with the Polkadot SDK (Substrate, FRAME, XCM)",
        "Chains talk to each other via XCM messages",
      ],
    },
    built: {
      title: "Developer relations across Southeast Asia",
      flow: [
        { label: "Builders in SEA" },
        { label: "Workshops", note: "& bootcamps" },
        { label: "Ecosystem programs" },
        { label: "Public sharing", note: "talks & writing" },
      ],
    },
    symbol: {
      name: "The workshop whiteboard",
      why: "Most of the job was a whiteboard, a marker, and a room full of builders. The diagram is still on it.",
    },
  },
  {
    id: "rogue",
    company: "R0GUE",
    role: "Software Engineer (Systems)",
    period: "Jul 2024 – Jul 2025",
    year: "2024",
    location: "Global, Remote",
    href: "https://www.linkedin.com/in/chungquantin/",
    summary:
      "Systems work on a Substrate-based L1: runtime performance, SDKs and cross-chain messaging.",
    bullets: [
      "Optimized Substrate-based runtime modules for a Layer 1 protocol, improving execution efficiency and reducing gas for core state transition functions.",
      "Built and open-sourced Rust SDKs and API wrappers, cutting onboarding time for external developers from days to hours.",
      "Refactored core SDKs for seamless XCM (Cross-Consensus Messaging) compatibility, enabling secure interoperability between heterogeneous networks.",
      "Implemented benchmarking suites in Rust to find bottlenecks in the consensus layer, improving block processing speed by 15%.",
    ],
    metrics: [
      { value: "+15%", label: "block processing" },
      { value: "days → hours", label: "dev onboarding" },
    ],
    stack: ["Rust", "Substrate", "XCM", "ink!", "Pop CLI"],
    org: {
      logo: "/logos/r0gue.png",
      brand: "#dc2626",
      website: "https://www.r0gue.io",
      oneLiner: "Strategic engineering for private AI and Web3 systems.",
      facts: [
        "Confidential AI infrastructure, TEE-backed systems and blockchain protocols",
        "Makers of Pop: “the all-in-one tool for Polkadot development” (Pop CLI)",
      ],
    },
    built: {
      title: "SDKs and runtime work on a Polkadot L1",
      flow: [
        { label: "Rust SDKs", note: "Pop CLI · days → hours" },
        { label: "Substrate runtime", note: "lower gas" },
        { label: "XCM", note: "cross-chain" },
        { label: "Benchmarks", note: "+15% blocks" },
      ],
    },
    symbol: {
      name: "The XCM orrery",
      why: "A relay chain at the centre, parachains in orbit, and messages arcing between them. Cross-consensus messaging, in brass.",
    },
  },
  {
    id: "rover",
    company: "Rover",
    role: "Founding Software Engineer (Data & Backend)",
    period: "Jul 2025 – 2026",
    year: "2025",
    location: "San Francisco, Remote",
    href: "https://rover.inc/",
    founding: true,
    summary:
      "Real-time blockchain data infrastructure: ingestion in Rust, a custom DSL and compiler, and a 60TB migration to columnar storage.",
    bullets: [
      "Engineered a high-throughput ingestion framework in Rust for real-time blockchain streams, with sub-second latency for downstream analytics.",
      "Designed a custom DSL and compiler that abstracts complex OLAP operations into a friendly syntax, transpiling directly to optimized ClickHouse SQL.",
      "Migrated 60TB+ of historical state from AWS RDS to ClickHouse Cloud, re-architecting the schema for columnar storage and cutting annual infra spend by 80% ($480k).",
      "Built modular, type-safe pipelines with Dagster and Rust, improving observability and reducing deployment failures by about 40%.",
    ],
    metrics: [
      { value: "60TB+", label: "migrated" },
      { value: "−80%", label: "infra spend ($480k/yr)" },
      { value: "<1s", label: "stream latency" },
      { value: "−40%", label: "deploy failures" },
    ],
    stack: ["Rust", "ClickHouse", "Dagster", "DSL / compiler", "OLAP"],
    org: {
      monogram: "R",
      brand: "#0f766e",
      oneLiner: "Real-time blockchain data infrastructure.",
      facts: [],
    },
    built: {
      title: "Chain data, from stream to columns",
      flow: [
        { label: "Chain streams", note: "real-time" },
        { label: "Rust ingestion", note: "sub-second" },
        { label: "DSL compiler", note: "→ ClickHouse SQL" },
        { label: "ClickHouse", note: "60TB · −80% cost" },
        { label: "Analytics" },
      ],
    },
    symbol: {
      name: "The block refinery",
      why: "Raw blocks flow out of the chain portal, down the glass pipe, and come out the other side as clean glowing columns.",
    },
  },
  {
    id: "architect",
    company: "Architect",
    role: "Software Engineer",
    period: "2026 –",
    year: "2026",
    href: "https://www.linkedin.com/in/chungquantin/",
    summary:
      "Built Liquid Inference, Architect's LLM gateway, from zero, and core trading systems for AX, a regulated perpetual futures exchange.",
    bullets: [
      "Built Liquid Inference from zero: an LLM gateway where providers compete on price for every request, touching almost every feature.",
      "Gateway supports text, image, speech, video and transcription, auto-routes each request to the cheapest model that can do the job, and lets teams bring their own keys.",
      "On AX, built the risk engine and the order management system for perpetual futures on forex, equities, commodities and indices.",
      "Built the market maker liquidity program for AX.",
      "Low-latency trading code in Rust; trader-facing surfaces in React and TypeScript.",
    ],
    metrics: [
      { value: "0 → 1", label: "Liquid Inference" },
      { value: "BYOK", label: "plus auto routing" },
      { value: "AX", label: "risk engine, OMS, MM program" },
    ],
    stack: ["Rust", "HFT", "TypeScript", "React", "LLM gateways", "Risk engines"],
    org: {
      logo: "/logos/architect.png",
      brand: "#0f172a",
      website: "https://architect.co",
      oneLiner: "The intelligence exchange: a market for compute, inference, commodities and currencies.",
      facts: [
        "AX: the first regulated exchange for perpetual futures on traditional assets",
        "Liquid Inference: providers compete on price for every AI request",
        "U.S. futures exchange plus an international exchange",
      ],
    },
    built: {
      title: "Liquid Inference, an LLM gateway built from zero",
      flow: [
        { label: "Your app", note: "or your own key" },
        { label: "Gateway", note: "multimodal" },
        { label: "Auto routing", note: "cheapest model that fits" },
        { label: "Providers", note: "compete per request" },
      ],
    },
    alsoBuilt: [
      {
        title: "AX perpetual futures: trading core",
        flow: [
          { label: "Traders", note: "React + TS" },
          { label: "Order management", note: "Rust" },
          { label: "Risk engine", note: "margin, liquidation" },
          { label: "Market makers", note: "liquidity program" },
        ],
      },
    ],
    symbol: {
      name: "The trading desk",
      why: "Live markets on the main screen, because that's the product now.",
    },
  },
];

export const chapterById = Object.fromEntries(
  chapters.map((c) => [c.id, c])
) as Record<ChapterId, Chapter>;

export const cvSummary =
  "Software engineer focused on distributed systems and data infrastructure. Built custom compilers and DSLs, real-time data pipelines in Rust, and 60TB+ database migrations, and scaled backend services for 1,200+ businesses, always with an eye on performance and cost.";

/** Accent colour per document on the jobs table. */
const JOB_ACCENTS = ["#e2571f", "#2563eb", "#16a34a", "#9333ea", "#db2777", "#0891b2", "#ca8a04", "#4f46e5", "#64748b"];

export type JobDocument = {
  id: "resume" | ChapterId;
  title: string;
  subtitle: string;
  period: string;
  accent: string;
  chapter?: Chapter;
};

/** The papers on the jobs table: a résumé summary, then newest job first. */
export function jobDocuments(): JobDocument[] {
  return [
    { id: "resume" as const, title: "Résumé", subtitle: "Tin Q. Chung", period: "summary" },
    ...[...chapters].reverse().map((c) => ({
      id: c.id,
      title: c.company,
      subtitle: c.role,
      period: c.period,
      chapter: c,
    })),
  ].map((d, i) => ({ ...d, accent: JOB_ACCENTS[i % JOB_ACCENTS.length] }));
}
