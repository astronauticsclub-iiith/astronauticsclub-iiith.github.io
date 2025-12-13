import Image from "next/image";
import { withUploadPath } from "@/components/common/HelperFunction";
import { ImgHTMLAttributes, ClassAttributes } from "react";
import React, { ReactNode } from "react";

// Define a simple type for the Markdown AST node
type MarkdownNodeDiv = {
  properties?: {
    className?: string | string[];
  };
};

type CSSWithVars = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};

export const markDownComponents = {
  h1: ({ ...props }) => (
    <h1
      className="text-[2.5rem] leading-tight tracking-tight font-extrabold text-foreground border-b border-accent pb-3 mt-12 mb-6 uppercase"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="text-[2rem] leading-snug tracking-tight font-bold text-foreground border-b border-accent-medium pb-2 mt-10 mb-5 uppercase"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className="text-[1.5rem] leading-snug font-semibold text-accent mt-8 mb-4 uppercase"
      {...props}
    />
  ),
  h4: ({ ...props }) => (
    <h4 className="text-[1.25rem] font-medium text-accent-medium mt-6 mb-3" {...props} />
  ),
  h5: ({ ...props }) => (
    <h5 className="text-[1.125rem] font-medium text-foreground mt-4 mb-2" {...props} />
  ),
  h6: ({ ...props }) => {
    return (
      <h6
        className="text-[1rem] font-semibold text-foreground opacity-70 mb-2 uppercase tracking-wide"
        {...props}
      ></h6>
    );
  },
  p: ({ ...props }) => {
    return <p className="text-foreground font-medium leading-[1.8] mb-6" {...props}></p>;
  },
  a: ({ ...props }) => (
    <a
      className="custom-link text-accent hover:text-accent-medium transition-colors duration-200"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: ({ ...props }) => (
    <blockquote
      className="border-l-4 border-accent px-5 py-3 pt-9 my-6 bg-accent-really-dark rounded-r-md text-foreground italic"
      {...props}
    />
  ),
  code: ({ ...props }) => (
    <pre className="bg-[var(--accent-really-dark)] p-5 my-6 rounded-lg overflow-x-auto text-sm text-foreground">
      <code className="hljs font-mono" {...props} />
    </pre>
  ),
  ul: ({ ...props }) => <ul className="list-disc pl-6 space-y-2 text-foreground mb-6" {...props} />,
  ol: ({ ...props }) => (
    <ol className="list-decimal pl-6 space-y-2 text-foreground mb-6" {...props} />
  ),
  li: ({ ...props }) => (
    <li className="ml-1 font-medium leading-relaxed text-foreground" {...props} />
  ),
  strong: ({ ...props }) => <strong className="text-foreground font-extrabold" {...props} />,
  em: ({ ...props }) => <em className="italic text-foreground" {...props} />,
  del: ({ ...props }) => <del className="line-through text-gray-500" {...props} />,
  hr: ({ ...props }) => <hr className="my-8 border-t border-accent" {...props} />,
  table: ({ ...props }) => (
    <table
      className="w-full my-8 border-collapse border border-[var(--accent-really-dark)]"
      {...props}
    />
  ),
  thead: ({ ...props }) => (
    <thead className="bg-[var(--accent-really-dark)] text-accent" {...props} />
  ),
  tbody: ({ ...props }) => <tbody className="text-foreground" {...props} />,
  tr: ({ ...props }) => <tr className="border-b border-[var(--accent-really-dark)]" {...props} />,
  th: ({ ...props }) => (
    <th
      className="text-left py-3 px-4 font-semibold text-accent border border-[var(--accent-really-dark)]"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="py-3 px-4 border border-[var(--accent-really-dark)] text-foreground"
      {...props}
    />
  ),
  img: ({
    src = "",
    alt = "",
    ...props
  }: ClassAttributes<HTMLImageElement> & ImgHTMLAttributes<HTMLImageElement>) => {
    if (typeof src !== "string") return null;

    // Destructure width and height out of props to avoid conflicts
    const { width: _width, height: _height, ...restProps } = props;

    // Match syntax like: ![alt](/path/image.png =300x200)
    const match = src.match(/^(.*)#(\d+)x(\d+)$/);
    let realSrc = src;
    let imgWidth: number = 800;
    let imgHeight: number = 400;

    if (match) {
      realSrc = match[1].trim(); // actual image path
      if (match[2]) imgWidth = Number(match[2]);
      if (match[3]) imgHeight = Number(match[3]);
    }

    return (
      <Image
        src={withUploadPath(realSrc)}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        unoptimized
        className="my-6 max-w-full rounded-lg shadow-lg border border-[var(--accent-really-dark)]"
        draggable={false}
        {...restProps}
      />
    );
  },

  // For text, image alignment
  div: ({ node, children }: { node?: MarkdownNodeDiv; children?: ReactNode }) => {
    const className = String(node?.properties?.className || "");
    let textAlign: "left" | "center" | "right" = "left";

    if (className.includes("align-center")) {
      textAlign = "center";
    } else if (className.includes("align-right")) {
      textAlign = "right";
    }

    const style: CSSWithVars = {
      textAlign,
      "--text-align": textAlign,
    };
    return <div style={style}>{children}</div>;
  },
};
