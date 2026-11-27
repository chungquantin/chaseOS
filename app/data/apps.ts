/**
 * Apps shown in the computer's "My apps" window, in display order.
 * Screenshots live in /public/apps (1000px wide JPEGs of each site's card).
 */
export type BuiltApp = {
  id: string;
  name: string;
  /** what kind of thing it is, e.g. "Mac app" */
  kind: string;
  /** one line: what it does for the person using it */
  tagline: string;
  /** a short paragraph for the detail view */
  about: string;
  /** what I did on it, specifically */
  built: string[];
  url: string;
  /** label for the open button's destination */
  host: string;
  screenshot?: string;
  /** square icon in /public */
  icon?: string;
  /** tile colour, also used as the accent in the detail view */
  color: string;
  tags: string[];
  /** how it's doing, shown as a tag on its statue */
  status?: "Live" | "Shipped";
  /** where it came from, e.g. the company */
  from?: string;
  /** a few facts worth showing as numbers */
  stats?: { value: string; label: string }[];
};

export const BUILT_APPS: BuiltApp[] = [
  {
    id: "liquid-inference",
    status: "Live",
    name: "Liquid Inference",
    kind: "AI gateway",
    tagline: "Providers compete on price for every AI request; you pay the lowest offer that meets your rules.",
    about:
      "An exchange for LLM inference. Every request goes up for auction, providers bid, and the cheapest offer that meets your latency and retention rules answers it.",
    built: [
      "Built the LLM gateway from zero, end to end",
      "Multimodal: chat, images, speech, video and transcription behind one API",
      "Auto routing to the cheapest model that can do the job",
      "Bring your own key, spend caps and per-request receipts",
    ],
    url: "https://liquidinference.ai/",
    host: "liquidinference.ai",
    screenshot: "/apps/liquid-inference.jpg",
    icon: "/apps/liquid-icon.svg",
    color: "#f0a04b",
    tags: ["LLM gateway", "Multimodal", "Auto routing", "BYOK"],
    from: "Architect",
    stats: [
      { value: "0 → 1", label: "built from zero" },
      { value: "1 API", label: "every modality" },
    ],
  },
  {
    id: "ax",
    status: "Live",
    name: "AX Exchange",
    kind: "Trading venue",
    tagline: "Perpetual futures on forex, equities, commodities and indices, on a regulated exchange.",
    about:
      "AX is Architect's regulated exchange for perpetual futures on traditional asset classes. I work on the parts that have to be fast and must never be wrong.",
    built: [
      "The risk engine: margin, liquidation and exposure checks",
      "The order management system",
      "The market maker liquidity program",
      "High-frequency paths in Rust, trader UI in React and TypeScript",
    ],
    url: "https://app.architect.exchange/",
    host: "app.architect.exchange",
    screenshot: "/apps/ax.jpg",
    icon: "/apps/ax-icon.svg",
    color: "#262626",
    tags: ["Rust", "HFT", "React", "TypeScript"],
    from: "Architect",
  },
  {
    id: "ai-keeper",
    status: "Shipped",
    name: "AI Keeper",
    kind: "Mac app",
    tagline: "Finds the gigabytes your coding agents leave behind and clears them safely.",
    about:
      "A free Mac app and command line tool. It finds the worktrees, build folders and caches that Claude Code, Codex, Conductor and other agents leave behind, shows what is safe to delete, and clears it in the background.",
    built: [
      "Designed and built the app and the CLI",
      "Scans agents, workspaces, duplicates and containers",
      "Explains what each folder is before you delete it",
    ],
    url: "https://chungquantin.github.io/ai-keeper/",
    host: "chungquantin.github.io",
    screenshot: "/apps/ai-keeper.jpg",
    icon: "/apps/ai-keeper-icon.svg",
    color: "#262626",
    tags: ["macOS", "CLI", "Developer tools"],
    from: "Side project",
  },
  {
    id: "liquid-pet",
    status: "Live",
    name: "Liquid Pet",
    kind: "Browser pet",
    tagline: "A pet that lives in your browser and answers when you talk to it.",
    about:
      "Inspired by the egg-shaped pocket pets: a small 3D room, an egg that hatches once you connect a key, and five needs that fall as the hours pass. Every time it hears you, thinks, speaks or draws, that is one Liquid call. Liquid picks the cheapest model for each job, so you can see what a hug costs, and a session stops at 25 cents.",
    built: [
      "Built the 3D room, the pet and its needs",
      "Every listen, thought, voice line and drawing is one Liquid call",
      "Shows the price of each interaction; sessions cap at $0.25",
    ],
    url: "https://liquidinference.ai/showcase/liquid-pet",
    host: "liquidinference.ai",
    screenshot: "/apps/liquid-pet.jpg",
    color: "#ffc27d",
    tags: ["3D", "Voice", "Liquid Inference"],
    from: "Made with Liquid Inference",
    stats: [{ value: "$0.25", label: "max per session" }],
  },
  {
    id: "mario-classic",
    status: "Live",
    name: "Mario Classic",
    kind: "Browser game",
    tagline: "The 1985 side-scroller, rebuilt to run in the browser.",
    about:
      "A browser version of the classic platformer, built as a showcase for Liquid Inference's CLI and Projects. Every token it took is counted from the exchange's receipts.",
    built: [
      "Built with the Liquid Inference CLI and Projects",
      "Showcases how a whole project's spend is tracked",
    ],
    url: "https://inference.ai.exchange/showcase/mario-classic",
    host: "inference.ai.exchange",
    screenshot: "/apps/mario-classic.jpg",
    color: "#c9852f",
    tags: ["Game", "Liquid CLI", "Projects"],
    from: "Made with Liquid Inference",
    stats: [
      { value: "80M", label: "tokens" },
      { value: "$18.41", label: "spent" },
      { value: "564", label: "receipts" },
    ],
  },
  {
    id: "amazely",
    status: "Shipped",
    name: "Amazely",
    kind: "SaaS",
    tagline: "Reputation marketing for local businesses, trusted by 1,200+ of them.",
    about:
      "All-in-one review management and reputation marketing for local businesses. I was a founding engineer and scaled the backend that serves 1,200+ businesses.",
    built: [
      "Founding engineer; built the backend microservices from zero",
      "Real-time AI content streaming",
      "Scaled services to 1,200+ businesses",
    ],
    url: "https://amazely.co/",
    host: "amazely.co",
    icon: "/apps/amazely.png",
    color: "#e0892a",
    tags: ["Backend", "AI", "SaaS"],
    from: "Amazely",
    stats: [{ value: "1,200+", label: "businesses" }],
  },
];
