import { cn } from "@/lib/utils";

/* Friendly illustrated avatar — neutral so it never competes with the primary button */
export function CuteAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("rounded-full", className)}
      role="img"
      aria-label="Profile"
    >
      <defs>
        <clipPath id="avatar-clip">
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath="url(#avatar-clip)">
        {/* background */}
        <rect width="32" height="32" fill="#C9C0F2" />
        {/* shoulders */}
        <path
          d="M6 32 c0 -5.4 4.5 -8.2 10 -8.2 s10 2.8 10 8.2 Z"
          fill="#8B7CF6"
        />
        {/* face */}
        <circle cx="16" cy="15" r="8.2" fill="#F3C393" />
        {/* hair */}
        <path
          d="M16 6.2 c-5 0 -8.8 3.9 -8.8 8.8 c0 1 .14 1.8 .38 2.5 c.6 -3.4 2.2 -5.4 4.1 -5.9 c2.9 -.8 5.7 -.8 8.6 0 c1.9 .5 3.5 2.5 4.1 5.9 c.24 -.7 .38 -1.5 .38 -2.5 c0 -4.9 -3.8 -8.8 -8.8 -8.8 Z"
          fill="#463229"
        />
        {/* eyes */}
        <circle cx="13.1" cy="16.2" r="1" fill="#33261f" />
        <circle cx="18.9" cy="16.2" r="1" fill="#33261f" />
        {/* smile */}
        <path
          d="M14.2 19.1 q1.8 1.5 3.6 0"
          stroke="#33261f"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        {/* blush */}
        <circle cx="11.3" cy="18.2" r="1" fill="#EC9C93" opacity="0.6" />
        <circle cx="20.7" cy="18.2" r="1" fill="#EC9C93" opacity="0.6" />
      </g>
    </svg>
  );
}
