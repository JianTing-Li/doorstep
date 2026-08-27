// Doorstep shared icon convention (Phase 2): 24x24, stroke=currentColor,
// stroke-width 1.7, round caps/joins, no fill — the same style
// chat/src/components/HeaderActions.jsx hand-draws its icons in. Replaces
// Font Awesome, which the original vanilla build loaded from a CDN.
const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  arrowLeft: <path d="M19 12H5M5 12l6-6M5 12l6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronUp: <path d="M6 15l6-6 6 6" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  closeCircle: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5l5 5M14.5 9.5l-5 5" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9" /></>,
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z" />,
  location: <><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="10" r="2.4" /></>,
  shield: <path d="M12 3l7 3v5.5c0 4.6-3 8.3-7 9.5-4-1.2-7-4.9-7-9.5V6l7-3Z" />,
  shieldCat: <><path d="M12 3l7 3v5.5c0 4.6-3 8.3-7 9.5-4-1.2-7-4.9-7-9.5V6l7-3Z" /><path d="M9.5 11l1 1.3M14.5 11l-1 1.3M10 14.5c.7.6 1.3.6 2 0" /></>,
  message: <path d="M4 5h16v11H8l-4 3.2V5Z" />,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2.4" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
  calendarCheck: <><rect x="3.5" y="5" width="17" height="16" rx="2.4" /><path d="M3.5 9.5h17M8 3v4M16 3v4M9 15l2 2 4-4.2" /></>,
  calendarWarn: <><rect x="3.5" y="5" width="17" height="16" rx="2.4" /><path d="M3.5 9.5h17M8 3v4M16 3v4M12 12v3.2" /><circle cx="12" cy="18" r="0.6" fill="currentColor" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  history: <><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 5v4h4" /><path d="M12 7.5V12l3 2" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  paperPlane: <path d="M21 3L11 13M21 3l-6.5 18-4-8-8-4L21 3Z" />,
  sliders: <><path d="M5 6h14M5 12h14M5 18h14" /><circle cx="9" cy="6" r="2" fill="var(--surface-soft, #fff)" /><circle cx="15" cy="12" r="2" fill="var(--surface-soft, #fff)" /><circle cx="9" cy="18" r="2" fill="var(--surface-soft, #fff)" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 14.2A5 5 0 0 1 21 20" /></>,
  receipt: <><path d="M6 3h12v18l-2.5-1.7L13 21l-2.5-1.7L8 21l-2-1.4V3Z" /><path d="M9 8h6M9 12h6" /></>,
  undo: <><path d="M3 5v5h5" /><path d="M3.5 10a9 9 0 1 1 1.4 7" /></>,
  door: <><path d="M6 21V4.5L18 3v18" /><path d="M6 21h12" /><circle cx="14.5" cy="12.5" r="0.7" fill="currentColor" /></>,
  warning: <><path d="M12 3.5l9.5 16.5H2.5L12 3.5Z" /><path d="M12 10v4" /><circle cx="12" cy="16.8" r="0.6" fill="currentColor" /></>,
  userCheck: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.6 2.7-6.5 6-6.5s6 2.9 6 6.5" /><path d="M16 12l2 2 3.5-3.8" /></>,
  sparkles: <><path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" /><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
  spinner: <><circle cx="12" cy="12" r="8.5" opacity="0.25" /><path d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5" /></>,
  broom: <><path d="M20 4l-8.5 8.5" /><path d="M9 15l-5 5" /><path d="M11 13l-4.5 4.5 2 2 4.5-4.5" /><path d="M9 15c-1.5-1.5-1.5-4 0-5.5s4-1.5 5.5 0" /></>,
  hammer: <><path d="M14.5 6.5l3 3L9 18l-3-3Z" /><path d="M14 3l4 4-1.5 1.5-4-4Z" /></>,
  box: <><path d="M3.5 8l8.5-4 8.5 4-8.5 4-8.5-4Z" /><path d="M3.5 8v9l8.5 4 8.5-4V8" /><path d="M12 12v9" /></>,
  seedling: <><path d="M12 21v-8" /><path d="M12 13C6 13 4 9 4 5c5 0 8 2 8 6" /><path d="M12 13c5 0 7-3.5 7-7-4.5 0-7 1.8-7 5.5" /></>,
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6 2.4 2.4 6-6a4 4 0 0 0 5-5.4l-2.5 2.5-2-2Z" />,
  home: <><path d="M4 11l8-7 8 7" /><path d="M6 10v10h12V10" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2.5" width="6" height="3" rx="1" /><path d="M8.5 12l2.2 2.2L15.5 10" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7" /><path d="M6.5 7l1 12.5a2 2 0 0 0 2 1.8h5a2 2 0 0 0 2-1.8L17.5 7" /><path d="M10 11v6M14 11v6" /></>,
};

export default function Icon({ name, className, size = 16, ...rest }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}
