export function Stars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex text-saffron" aria-label={`${rating.toFixed(1)} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - (i - 1)));
        return (
          <svg key={i} viewBox="0 0 20 20" className={size} aria-hidden>
            <defs>
              <linearGradient id={`s${i}-${fill}`}>
                <stop offset={fill} stopColor="currentColor" />
                <stop offset={fill} stopColor="#d6d3d1" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#s${i}-${fill})`}
              d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"
            />
          </svg>
        );
      })}
    </span>
  );
}
