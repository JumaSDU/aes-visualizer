import React from "react";

const paths = {
  home: <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V11z" />,
  practice: <path d="M12 2a4 4 0 014 4v3h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9a2 2 0 012-2h2V6a4 4 0 014-4zm0 2a2 2 0 00-2 2v3h4V6a2 2 0 00-2-2z" />,
  cards: <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v3H3V7zm0 5h18v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z" />,
  video: <path d="M4 6a2 2 0 012-2h9a2 2 0 012 2v2.5l4-2.5v12l-4-2.5V18a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />,
  test: <path d="M9 3h6a1 1 0 011 1v2h3a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3V4a1 1 0 011-1zm0 3h6V5H9v1zm-2 8l2 2 5-5-1.4-1.4L9 13.2 8.4 12.6 7 14z" />,
  trophy: <path d="M7 4h10v2h3v3a4 4 0 01-4 4 5 5 0 01-2 .9V16h2v2H8v-2h2v-2.1A5 5 0 018 13a4 4 0 01-4-4V6h3V4zm-1 4v1a2 2 0 002 2V8H6zm12 0h-2v3a2 2 0 002-2V8z" />,
  shield: <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" />,
  lock: <path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1h1zm2 0h8V8a4 4 0 00-8 0v2z" />,
  code: <path d="M9.4 7.6L4 13l5.4 5.4 1.4-1.4L6.8 13l4-4-1.4-1.4zm5.2 0l-1.4 1.4 4 4-4 4 1.4 1.4L20 13l-5.4-5.4z" />,
  zap: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  play: <path d="M8 5v14l11-7L8 5z" />,
  chev: <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
};

export default function Icon({ name, size = 18, color = "currentColor", style, className }) {
  const node = paths[name];
  if (!node) return null;
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill={name === "chev" ? "none" : color}
      style={style}
      className={className}
      aria-hidden="true"
    >
      {node}
    </svg>
  );
}
