/* Rain logo mark — a standalone gradient raindrop carrying a white check.
   Pink (primary) → violet (chart series), constant across themes.
   `white` / `black` render monochrome versions for solid surfaces. */
export function RainMark({
  className,
  white = false,
  black = false,
}: {
  className?: string;
  white?: boolean;
  black?: boolean;
}) {
  if (white || black) {
    const body = black ? "#0a0a0a" : "#fff";
    const check = black ? "#fff" : "#0e0c0d";
    return (
      <svg
        viewBox="0 0 32 40"
        className={className}
        role="img"
        aria-label="Rain"
      >
        <path
          d="M16 2 C16 2 3 16.5 3 26 a13 13 0 0 0 26 0 C29 16.5 16 2 16 2 Z"
          fill={body}
        />
        <path
          d="M10.6 26.6 l4 4 l7.4 -8.4"
          fill="none"
          stroke={check}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 40" className={className} role="img" aria-label="Rain">
      <defs>
        <linearGradient id="rain-drop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F87BAB" />
          <stop offset="46%" stopColor="#E8508D" />
          <stop offset="100%" stopColor="#7C6CF0" />
        </linearGradient>
        <linearGradient id="rain-drop-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Droplet */}
      <path
        d="M16 2 C16 2 3 16.5 3 26 a13 13 0 0 0 26 0 C29 16.5 16 2 16 2 Z"
        fill="url(#rain-drop)"
      />
      {/* Soft top sheen for depth */}
      <path
        d="M16 2 C16 2 3 16.5 3 26 a13 13 0 0 0 26 0 C29 16.5 16 2 16 2 Z"
        fill="url(#rain-drop-sheen)"
      />

      {/* White check inside the drop */}
      <path
        d="M10.6 26.6 l4 4 l7.4 -8.4"
        fill="none"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
