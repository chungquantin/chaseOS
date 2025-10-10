"use client";

import { Building2, Users, Calendar, MapPin, ExternalLink } from "lucide-react";
import { BaseWindow } from "./base-window";

interface CompanyInfo {
  name: string;
  logo: string;
  description: string;
  role: string;
  duration: string;
  location: string;
  website: string;
  technologies: string[];
  achievements: string[];
}

interface CompanyWindowProps {
  company: CompanyInfo;
  onClose: () => void;
  onMinimize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  zIndex?: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

const companies: Record<string, CompanyInfo> = {
  polkadot: {
    name: "Polkadot",
    logo: "🟣",
    description:
      "Polkadot is a next-generation blockchain protocol that enables different blockchains to transfer messages and value in a trust-free fashion; sharing their unique features while pooling their security.",
    role: "Core Developer",
    duration: "2021 - 2023",
    location: "Remote",
    website: "https://polkadot.network",
    technologies: [
      "Rust",
      "Substrate",
      "WebAssembly",
      "Cryptography",
      "P2P Networking",
    ],
    achievements: [
      "Contributed to core Polkadot runtime development",
      "Implemented critical consensus mechanisms",
      "Optimized block production algorithms",
      "Mentored junior developers in blockchain development",
    ],
  },
  substrate: {
    name: "Substrate",
    logo: "⚡",
    description:
      "Substrate is a modular framework for building blockchains. It provides the core components needed to build a blockchain, including networking, consensus, and a runtime environment.",
    role: "Framework Developer",
    duration: "2020 - 2022",
    location: "Remote",
    website: "https://substrate.io",
    technologies: [
      "Rust",
      "WebAssembly",
      "Consensus",
      "Networking",
      "Cryptography",
    ],
    achievements: [
      "Developed core Substrate framework components",
      "Built custom consensus algorithms",
      "Created developer tooling and documentation",
      "Contributed to open source ecosystem",
    ],
  },
  parity: {
    name: "Parity Technologies",
    logo: "🔧",
    description:
      "Parity Technologies is a core blockchain infrastructure company. We build open-source software for the decentralized web, including Ethereum and Polkadot clients.",
    role: "Senior Software Engineer",
    duration: "2019 - 2021",
    location: "Berlin, Germany",
    website: "https://parity.io",
    technologies: ["Rust", "Ethereum", "Polkadot", "Substrate", "Cryptography"],
    achievements: [
      "Developed Ethereum client optimizations",
      "Built Polkadot parachain infrastructure",
      "Led technical architecture decisions",
      "Contributed to Web3 Foundation projects",
    ],
  },
  web3: {
    name: "Web3 Foundation",
    logo: "🌐",
    description:
      "The Web3 Foundation nurtures and stewards technologies and applications in the fields of decentralized web software protocols.",
    role: "Technical Advisor",
    duration: "2021 - Present",
    location: "Remote",
    website: "https://web3.foundation",
    technologies: [
      "Blockchain",
      "Cryptography",
      "Governance",
      "Research",
      "Open Source",
    ],
    achievements: [
      "Provided technical guidance on Web3 protocols",
      "Contributed to research initiatives",
      "Supported ecosystem development",
      "Mentored blockchain startups",
    ],
  },
};

export function CompanyWindow({
  company,
  onClose,
  onMinimize,
  onRestore,
  onFocus,
  zIndex,
  initialPosition = { x: 200, y: 200 },
  initialSize = { width: 700, height: 500 },
}: CompanyWindowProps) {
  return (
    <BaseWindow
      title={`${company.name} - Company Info`}
      onClose={onClose}
      onMinimize={onMinimize}
      onRestore={onRestore}
      onFocus={onFocus}
      zIndex={zIndex}
      initialPosition={initialPosition}
      initialSize={initialSize}
    >
      <div className="p-6 space-y-6">
        {/* Company Header */}
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{company.logo}</div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#f0f6fc" }}>
              {company.name}
            </h1>
            <div
              className="flex items-center space-x-4 text-sm"
              style={{ color: "#8b949e" }}
            >
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{company.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>{company.location}</span>
              </div>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:underline"
                style={{ color: "#58a6ff" }}
              >
                <ExternalLink size={14} />
                <span>Website</span>
              </a>
            </div>
          </div>
        </div>

        {/* Role */}
        <div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "#f0f6fc" }}
          >
            Role: {company.role}
          </h2>
        </div>

        {/* Description */}
        <div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "#f0f6fc" }}
          >
            About
          </h2>
          <p className="leading-relaxed" style={{ color: "#e6edf3" }}>
            {company.description}
          </p>
        </div>

        {/* Technologies */}
        <div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "#f0f6fc" }}
          >
            Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {company.technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: "#161b22",
                  color: "#58a6ff",
                  border: "1px solid #21262d",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "#f0f6fc" }}
          >
            Key Achievements
          </h2>
          <ul className="space-y-2">
            {company.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span style={{ color: "#e6edf3" }}>{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </BaseWindow>
  );
}

export { companies };
