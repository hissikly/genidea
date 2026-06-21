"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed text-neutral-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="mt-4 mb-2 text-xl font-bold text-white" {...props} />
          ),
          h2: (props) => (
            <h2
              className="mt-4 mb-1 text-lg font-semibold text-orange-400"
              {...props}
            />
          ),
          h3: (props) => (
            <h3 className="mt-3 mb-1 font-semibold text-white" {...props} />
          ),
          p: (props) => <p className="my-2" {...props} />,
          ul: (props) => (
            <ul className="my-2 list-disc space-y-1 pl-5" {...props} />
          ),
          ol: (props) => (
            <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />
          ),
          li: (props) => <li className="marker:text-neutral-500" {...props} />,
          strong: (props) => (
            <strong className="font-semibold text-white" {...props} />
          ),
          a: (props) => (
            <a
              className="text-orange-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          code: (props) => (
            <code
              className="rounded bg-neutral-800 px-1 py-0.5 text-xs"
              {...props}
            />
          ),
          hr: () => <hr className="my-4 border-neutral-800" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
