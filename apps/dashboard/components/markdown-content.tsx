"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  className?: string;
  children: string;
};

export function MarkdownContent({ className, children }: MarkdownContentProps) {
  if (!children.trim()) return null;

  return (
    <div className={cn("space-y-2 text-sm leading-relaxed text-muted-foreground", className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {children}
      </Markdown>
    </div>
  );
}

const markdownComponents = {
  h1: ({ children }: ComponentProps<"h1">) => (
    <h3 className="text-base font-semibold text-foreground">{children}</h3>
  ),
  h2: ({ children }: ComponentProps<"h2">) => (
    <h4 className="text-sm font-semibold text-foreground">{children}</h4>
  ),
  h3: ({ children }: ComponentProps<"h3">) => (
    <h5 className="text-sm font-medium text-foreground">{children}</h5>
  ),
  h4: ({ children }: ComponentProps<"h4">) => (
    <h6 className="text-sm font-medium text-foreground">{children}</h6>
  ),
  p: ({ children }: ComponentProps<"p">) => <p>{children}</p>,
  ul: ({ children }: ComponentProps<"ul">) => (
    <ul className="list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }: ComponentProps<"ol">) => (
    <ol className="list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }: ComponentProps<"li">) => <li>{children}</li>,
  strong: ({ children }: ComponentProps<"strong">) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  em: ({ children }: ComponentProps<"em">) => <em>{children}</em>,
  blockquote: ({ children }: ComponentProps<"blockquote">) => (
    <blockquote className="border-l-2 border-border/70 pl-3">{children}</blockquote>
  ),
  a: ({ href, children }: ComponentProps<"a">) => (
    <a href={href} className="text-foreground underline underline-offset-2" rel="noreferrer">
      {children}
    </a>
  ),
  code: ({ className, children }: ComponentProps<"code">) => {
    const inline = !className;
    if (inline) {
      return (
        <code className="rounded bg-muted/60 px-1 py-0.5 font-mono text-xs text-foreground">
          {children}
        </code>
      );
    }
    return <code className={cn("font-mono text-xs", className)}>{children}</code>;
  },
  pre: ({ children }: ComponentProps<"pre">) => (
    <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 font-mono text-xs">{children}</pre>
  ),
};
