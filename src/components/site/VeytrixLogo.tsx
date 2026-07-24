export function VeytrixLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="vx-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.17 200)" />
          <stop offset="100%" stopColor="oklch(0.75 0.22 320)" />
        </linearGradient>
      </defs>
      <path
        d="M4 4 L14 26 L18 26 L28 4 L23 4 L16 20 L9 4 Z"
        fill="url(#vx-g)"
      />
      <circle cx="26" cy="26" r="2.5" fill="oklch(0.82 0.17 200)" />
    </svg>
  );
}
