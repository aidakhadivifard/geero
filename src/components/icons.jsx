// Small inline icons (stroke = currentColor) so they inherit text color.
const S = (props) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...props,
});

export const SunIcon = (p) => (
  <svg {...S(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
  </svg>
);
export const BookmarkIcon = ({ filled, ...p }) => (
  <svg {...S(p)} fill={filled ? "currentColor" : "none"}>
    <path d="M6 4h12v16l-6-4-6 4V4z" />
  </svg>
);
export const CalendarIcon = (p) => (
  <svg {...S(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);
export const GearIcon = (p) => (
  <svg {...S(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2l1.6 2.6 3-.4.4 3L20.6 11l-1.6 2.6L20 17l-2.6.4-1 2.8L12 22l-2.4-1.8-2.6-.4L6 17l-2-1.4L5.4 13 4 11l2.6-2.2.4-3 3 .4L12 2z" opacity="0.0" />
    <path d="M19.4 13a7.6 7.6 0 000-2l2-1.5-2-3.4-2.4 1a7.6 7.6 0 00-1.7-1l-.3-2.6H10l-.3 2.6a7.6 7.6 0 00-1.7 1l-2.4-1-2 3.4L5.6 11a7.6 7.6 0 000 2l-2 1.5 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.3 2.6h4l.3-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4L19.4 13z" />
  </svg>
);
export const MicIcon = (p) => (
  <svg {...S(p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0014 0M12 18v3" />
  </svg>
);
export const SendIcon = (p) => (
  <svg {...S(p)}>
    <path d="M4 12l16-8-6 16-3-7-7-1z" />
  </svg>
);
export const RefreshIcon = (p) => (
  <svg {...S(p)}>
    <path d="M20 11a8 8 0 10-1.5 5M20 5v6h-6" />
  </svg>
);
export const SparkIcon = (p) => (
  <svg {...S(p)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    <path d="M18.5 14.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
  </svg>
);
export const ChatIcon = (p) => (
  <svg {...S(p)}>
    <path d="M4 5h16v11H9l-5 4V5z" />
  </svg>
);
export const CheckIcon = (p) => (
  <svg {...S(p)}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);
export const CloseIcon = (p) => (
  <svg {...S(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const CopyIcon = (p) => (
  <svg {...S(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 012-2h8" />
  </svg>
);
