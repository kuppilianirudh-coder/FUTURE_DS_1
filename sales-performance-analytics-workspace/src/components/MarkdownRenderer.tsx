/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split('\n');

  return (
    <div className="space-y-3 text-slate-300 font-sans tracking-wide leading-relaxed prose prose-invert max-w-none">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Header 1 (#)
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-2xl font-bold text-sky-400 border-b border-slate-700/60 pb-2 mt-5">
              {trimmed.substring(2)}
            </h1>
          );
        }

        // Header 2 (##)
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-xl font-bold text-sky-300 mt-4 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-sky-500 rounded-sm"></span>
              {trimmed.substring(3)}
            </h2>
          );
        }

        // Header 3 (###)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg font-semibold text-slate-100 mt-3">
              {trimmed.substring(4)}
            </h3>
          );
        }

        // Unordered list (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const listText = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-3">
              <span className="text-sky-400 mt-1.5 text-xs">◆</span>
              <span className="flex-1">{parseInlineStyles(listText)}</span>
            </div>
          );
        }

        // List item with numerical index (e.g. "1. ")
        const numListMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numListMatch) {
          const num = numListMatch[1];
          const text = numListMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-3">
              <span className="text-sky-400 font-bold font-mono text-sm">{num}.</span>
              <span className="flex-1">{parseInlineStyles(text)}</span>
            </div>
          );
        }

        // Code block indicator (```)
        if (trimmed.startsWith('```')) {
          return null; // Ignore tag lines
        }

        // Empty line
        if (trimmed === '') {
          return <div key={idx} className="h-2"></div>;
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-slate-300 antialiased leading-relaxed">
            {parseInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Helper to convert bold markdown **text** into elegant high-visibility tags
function parseInlineStyles(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-slate-800 text-teal-400 font-mono text-xs rounded border border-slate-700">
          {part.substring(1, part.length - 1)}
        </code>
      );
    }
    return part;
  });
}
