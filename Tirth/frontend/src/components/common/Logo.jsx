function Logo({ compact = false }) {
  return (
    <div className="airguard-logo">
      <div className="logo-symbol">
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="airguardGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#39dcff" />
              <stop offset="100%" stopColor="#9587ff" />
            </linearGradient>
          </defs>

          <path
            d="M32 5L52 13V28C52 42 44 52 32 59C20 52 12 42 12 28V13L32 5Z"
            fill="url(#airguardGradient)"
          />

          <path
            d="M20 29C25 25 29 25 34 29C39 33 43 33 48 29"
            fill="none"
            stroke="#06131f"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <path
            d="M18 20C24 17 29 17 35 20C40 23 44 23 48 20"
            fill="none"
            stroke="#06131f"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />

          <circle
            cx="32"
            cy="40"
            r="3"
            fill="#06131f"
          />
        </svg>
      </div>

      {!compact && (
        <div className="logo-copy">
          <strong>AirGuard AI</strong>
          <span>Environmental Intelligence Network</span>
        </div>
      )}
    </div>
  );
}

export default Logo;