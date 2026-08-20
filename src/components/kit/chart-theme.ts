export const gridProps = {
  strokeDasharray: "3 3",
  stroke: "var(--color-border)",
  vertical: false,
} as const;

export const axisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const chartTooltip = {
  cursor: { fill: "var(--color-accent)", opacity: 0.35 },
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "var(--color-popover-foreground)",
    boxShadow: "var(--shadow-panel)",
  },
  labelStyle: { color: "var(--color-muted-foreground)", marginBottom: 4 },
} as const;

export const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];
