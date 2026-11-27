import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";
import React from "react";

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function CustomLink(props) {
  let href = props.href;

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return <a {...props} />;
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />;
}

/**
 * Markdown images. Notion exports use paths relative to the post
 * ("Folder%20Name/image.png"); posts render under /blog/<slug>, so those would
 * resolve to /blog/Folder…/ and 404. The files live at the root of public/.
 */
function PostImage({ src = "", alt = "", title, ...props }) {
  const url = /^(https?:)?\/\//.test(src) || src.startsWith("/") || src.startsWith("data:") ? src : `/${src}`;
  return (
    <figure className="post-figure">
      <img src={url} alt={alt} loading="lazy" {...props} />
      {alt && <figcaption>{alt}</figcaption>}
    </figure>
  );
}

/**
 * A paragraph that only holds an image would put a <figure> inside a <p>;
 * unwrap it. Notion also repeats each image's caption as the next paragraph:
 * that one is dropped by `dropEchoedCaptions` below.
 */
function Paragraph({ children, ...props }) {
  const only = React.Children.toArray(children);
  if (only.length === 1 && React.isValidElement(only[0]) && (only[0] as any).type === PostImage) return <>{children}</>;
  return <p {...props}>{children}</p>;
}

/** Remove the plain-text line Notion puts under an image when it repeats the alt text. */
export function dropEchoedCaptions(source: string) {
  const lines = source.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    const image = lines[i].match(/^!\[([^\]]*)\]\([^)]+\)\s*$/);
    if (!image) continue;
    const alt = image[1].trim();
    if (!alt) continue;
    // Notion repeats the caption as the next plain paragraph, often with a
    // trailing space on the alt text; compare trimmed text, skip blank lines.
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;
    if (lines[j]?.trim() === alt) {
      out.push(...lines.slice(i + 1, j));
      i = j;
    }
  }
  return out.join("\n");
}

function Code({ children, ...props }) {
  let codeHTML = highlight(children);
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}

function Iframe({
  src,
  title,
  width = "100%",
  height = "400",
  className = "",
  ...props
}) {
  return (
    <div className={`my-6 ${className}`}>
      <iframe
        src={src}
        title={title || "Embedded content"}
        width={width}
        height={height}
        className="w-full rounded-lg border border-gray-700"
        style={{
          maxWidth: "100%",
          aspectRatio: props.aspectRatio || "auto",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        {...props}
      />
    </div>
  );
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children);
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
        }),
      ],
      children
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  img: PostImage,
  p: Paragraph,
  a: CustomLink,
  code: Code,
  Table,
  Iframe,
};

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      source={typeof props.source === "string" ? dropEchoedCaptions(props.source) : props.source}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
