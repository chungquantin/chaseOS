"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  return (
    <div className="prose dark:prose-invert max-w-none overflow-hidden break-words">
      <div className="break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // Custom components for better styling
            h1: ({ children }) => (
              <h1
                className="text-3xl font-bold mt-8 mb-4"
                style={{ color: "#f0f6fc" }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                className="text-2xl font-bold mt-6 mb-4"
                style={{ color: "#f0f6fc" }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                className="text-xl font-semibold mt-4 mb-3"
                style={{ color: "#f0f6fc" }}
              >
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4
                className="text-lg font-semibold mt-3 mb-2"
                style={{ color: "#f0f6fc" }}
              >
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed" style={{ color: "#e6edf3" }}>
                {children}
              </p>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-medium"
                style={{ color: "#58a6ff" }}
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote
                className="pl-4 italic my-4 py-2 rounded-r"
                style={{
                  borderLeft: "4px solid #58a6ff",
                  backgroundColor: "#161b22",
                  color: "#8b949e",
                }}
              >
                {children}
              </blockquote>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code
                    className="px-1 py-0.5 rounded text-sm font-mono"
                    style={{
                      backgroundColor: "#161b22",
                      color: "#f85149",
                    }}
                  >
                    {children}
                  </code>
                );
              }
              return <code className={className}>{children}</code>;
            },
            pre: ({ children }) => (
              <pre
                className="p-4 rounded-lg overflow-x-auto my-4"
                style={{
                  backgroundColor: "#161b22",
                  border: "1px solid #21262d",
                }}
              >
                {children}
              </pre>
            ),
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt}
                className="rounded-lg my-4 max-w-full h-auto object-contain"
                style={{ maxHeight: "400px" }}
              />
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 text-gray-200 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 text-gray-200 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="ml-2">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold text-white">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-200">{children}</em>
            ),
            hr: () => <hr className="my-8 border-gray-800" />,
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-800">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-900">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border border-gray-800 px-4 py-2 text-left font-semibold text-white">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-800 px-4 py-2 text-gray-200">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
