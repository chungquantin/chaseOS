import Link from "next/link";
import { formatDate, getBlogPosts } from "app/blog/utils";
import { Typewriter } from "app/components/typewriter";

const work = [
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

const beliefs = [
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

const modes = [
  "perpetual exchange engineering",
  "real-time blockchain data systems",
  "Rust and protocol infrastructure",
  "Polkadot developer education",
];

export default function Page() {
  const posts = getBlogPosts()
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#171717]">
      <div className="editorial-shell mx-auto min-h-screen w-full max-w-[720px] px-5 py-5 sm:px-6">
        <header className="flex items-center justify-between text-[15px] leading-6">
          <Link href="/" className="font-medium text-[#171717]">
            chungquantin
          </Link>
          <nav className="flex items-center gap-4 text-[#77756f]">
            <a className="portfolio-link" href="https://x.com/chungquantin">
              X
            </a>
            <a
              className="portfolio-link"
              href="https://www.linkedin.com/in/chungquantin/"
            >
              Contact
            </a>
            <a className="portfolio-link" href="#work">
              Work
            </a>
          </nav>
        </header>

        <section className="pt-28 sm:pt-36">
          <p className="max-w-[650px] text-[34px] font-medium leading-[1.08] tracking-normal sm:text-[54px] sm:leading-[1.02]">
            I build infrastructure and developer surfaces for crypto systems
            that need to be understood, not just used.
          </p>
          <p className="mt-10 max-w-[620px] text-[18px] leading-8 text-[#3d3c38] sm:text-[20px] sm:leading-9">
            My work spans protocol engineering, real-time data systems,
            ecosystem education, and product interfaces because technical
            systems only matter when people can reason through them.
          </p>
          <p className="mt-6 max-w-[620px] text-[16px] leading-7 text-[#64625c]">
            Currently at Architect
            <sup>
              <a href="#work-0">0</a>
            </sup>
            , after building at Rover
            <sup>
              <a href="#work-1">1</a>
            </sup>
            , representing Polkadot in Southeast Asia
            <sup>
              <a href="#work-2">2</a>
            </sup>
            , and co-founding OpenGuild
            <sup>
              <a href="#work-3">3</a>
            </sup>
            .
          </p>
          <p className="mt-6 font-mono text-[13px] text-[#8a8985]">
            <Typewriter phrases={modes} />
          </p>
        </section>

        <section id="work" className="pt-24 sm:pt-32">
          <div className="grid gap-5">
            {work.map((item) => (
              <a
                id={`work-${item.index}`}
                key={item.index}
                href={item.href}
                className="editorial-work-row group grid grid-cols-[36px_minmax(0,1fr)] gap-5 py-3"
              >
                <span className="font-mono text-[13px] text-[#aaa8a1]">
                  {item.index}
                </span>
                <span>
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[20px] font-medium leading-6 text-[#171717]">
                      {item.title}
                    </span>
                    <span className="text-[15px] text-[#77756f]">
                      {item.meta}
                    </span>
                  </span>
                  <span className="mt-1 block text-[14px] leading-6 text-[#77756f]">
                    {item.note}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="pt-20 sm:pt-28">
          <p className="text-[17px] leading-8 text-[#3d3c38]">
            These experiences shaped a few working beliefs. They are not rules,
            but defaults I keep returning to when a system, team, or product
            starts to feel too clever for its own good.
          </p>

          <div className="mt-14 grid gap-14">
            {beliefs.map((belief) => (
              <article key={belief.title}>
                <h2 className="text-[26px] font-medium leading-tight tracking-normal text-[#171717]">
                  {belief.title}
                </h2>
                <p className="mt-4 text-[17px] leading-8 text-[#3d3c38]">
                  {belief.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-20 sm:pt-28">
          <div className="flex items-baseline justify-between gap-5">
            <h2 className="text-[17px] font-medium text-[#171717]">Writing</h2>
            <Link className="portfolio-link text-[15px] text-[#77756f]" href="/blog">
              View all →
            </Link>
          </div>
          <div className="mt-5 grid gap-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="editorial-work-row grid grid-cols-[104px_minmax(0,1fr)] gap-4 py-2"
              >
                <span className="text-[13px] text-[#8a8985]">
                  {formatDate(post.metadata.publishedAt)}
                </span>
                <span className="text-[16px] leading-6 text-[#171717]">
                  {post.metadata.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="flex items-center justify-between pb-6 pt-24 text-[15px] text-[#8a8985]">
          <span>chungquantin.com</span>
          <div className="flex items-center gap-4">
            <Link className="portfolio-link" href="/os">
              Archive
            </Link>
            <Link className="portfolio-link" href="/rss">
              RSS
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
