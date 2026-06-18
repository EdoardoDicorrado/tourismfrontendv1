/** Star rating row. Renders 5 stars with the `rate` token color, supporting halves. */
export function Stars({
  value,
  size = 16,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${value} su 5 stelle`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i)); // 0..1 for this star
        return <Star key={i} fill={fill} size={size} />;
      })}
    </div>
  );
}

function Star({ fill, size }: { fill: number; size: number }) {
  const id = `star-${Math.round(fill * 100)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="var(--color-rate)" />
          <stop offset={`${fill * 100}%`} stopColor="var(--color-soft-grey)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.77l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.5z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}
