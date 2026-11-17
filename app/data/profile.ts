export type WorkItem = {
  index: string;
  title: string;
  meta: string;
  href: string;
  note: string;
};

export type Belief = { title: string; body: string };

export const profile = {
  name: "Tin Chung",
  handle: "chungquantin",
  role: "Software Engineer at Architect",
  headline:
    "I build infrastructure and developer surfaces for crypto systems that need to be understood, not just used.",
  summary:
    "My work spans protocol engineering, real-time data systems, ecosystem education, and product interfaces because technical systems only matter when people can reason through them.",
  links: {
    x: "https://x.com/chungquantin",
    linkedin: "https://www.linkedin.com/in/chungquantin/",
    github: "https://github.com/chungquantin",
  },
};

export const modes = [
  "perpetual exchange engineering",
  "real-time blockchain data systems",
  "Rust and protocol infrastructure",
  "Polkadot developer education",
];

export const work: WorkItem[] = [
  {
    index: "0",
    title: "Architect",
    meta: "2026- | Software Engineer",
    href: "https://www.linkedin.com/in/chungquantin/",
    note: "Building a perpetual exchange.",
  },
  {
    index: "1",
    title: "Rover, Inc",
    meta: "2025-2026 | Software Engineer",
    href: "https://rover.inc/",
    note: "Rust ingestion framework, real-time blockchain streams, ClickHouse DSL.",
  },
  {
    index: "2",
    title: "Polkadot",
    meta: "2024-2026 | SEA Developer Relation Lead",
    href: "https://polkadot.network/",
    note: "Developer education, workshops, ecosystem programs, public technical sharing.",
  },
  {
    index: "3",
    title: "OpenGuild",
    meta: "2023-2026 | Co-Founder",
    href: "https://github.com/openguild-labs",
    note: "A Southeast Asia developer community for Polkadot builders.",
  },
  {
    index: "4",
    title: "ROGUE",
    meta: "2024-2025 | Rust & Substrate Engineer",
    href: "https://www.linkedin.com/in/chungquantin/",
    note: "Pop Network, Pop CLI, Substrate runtime modules, ink! testing.",
  },
  {
    index: "5",
    title: "Amazely",
    meta: "2023-2024 | Software Engineer",
    href: "https://www.linkedin.com/in/chungquantin/",
    note: "Product engineering and infrastructure systems.",
  },
  {
    index: "6",
    title: "Snowflake Network",
    meta: "2022-2023 | Software Engineer",
    href: "https://www.linkedin.com/in/chungquantin/",
    note: "React.js, Rust, and engineering infrastructure.",
  },
  {
    index: "7",
    title: "Ninety Eight",
    meta: "2021-2022 | Blockchain Developer",
    href: "https://www.linkedin.com/in/chungquantin/",
    note: "Early blockchain engineering work.",
  },
];

export const beliefs: Belief[] = [
  {
    title: "Build from the data path",
    body: "The most honest view of a protocol is usually not the pitch deck or the interface. It is the path an event takes through the system: where it is produced, how it is transformed, what gets dropped, and what can still be explained after the fact.",
  },
  {
    title: "Developer relations is infrastructure",
    body: "A workshop, a bootcamp, a clear example, or a patient answer can unblock more builders than another abstraction. Ecosystems compound when knowledge moves with low friction, and the best DevRel work feels like reducing latency in the human layer.",
  },
  {
    title: "The interface should preserve the protocol",
    body: "A clean product is not one that hides complexity by pretending it does not exist. It is one that lets people touch the right amount of complexity at the right moment, without losing the shape of the system underneath.",
  },
];

/**
 * The ID card first-time visitors see. Three pillars, each backed by what's
 * in the CV — edit the wording freely.
 */
export const idCard = {
  name: "Tin Chung",
  title: "Software Engineer",
  avatar: "/brand/profile-avatar.png",
  pillars: [
    {
      key: "blockchain",
      label: "Blockchain",
      line: "Substrate runtimes, XCM SDKs, real-time chain data in Rust",
      color: "#e6007a",
    },
    {
      key: "inference",
      label: "Inference",
      line: "Built the Liquid Inference LLM gateway from zero; AI streaming for 1,200+ businesses",
      color: "#3fb8ff",
    },
    {
      key: "gtm",
      label: "GTM",
      line: "Polkadot DevRel lead for SEA, co-founded OpenGuild, founding engineer ×2",
      color: "#f59e0b",
    },
  ],
  stats: [
    { value: "5+", label: "years shipping" },
    { value: "8", label: "roles" },
    { value: "3", label: "founding teams" },
    { value: "60TB", label: "largest migration" },
  ],
};
