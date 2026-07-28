export default function WCGeometry({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--wc-gold)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--wc-gold-dark)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Geometric "2" */}
      <rect x="20" y="20" width="30" height="30" rx="2" fill="url(#goldGrad)" />
      <rect x="55" y="20" width="30" height="30" rx="2" fill="url(#goldGrad)" />
      <rect x="90" y="20" width="20" height="30" rx="15" fill="url(#goldGrad)" />
      <rect x="90" y="55" width="20" height="30" rx="2" fill="url(#goldGrad)" />
      <rect x="55" y="90" width="55" height="20" rx="2" fill="url(#goldGrad)" />
      <rect x="20" y="115" width="90" height="20" rx="2" fill="url(#goldGrad)" />
      {/* Geometric "6" */}
      <rect x="120" y="20" width="30" height="20" rx="2" fill="url(#goldGrad)" />
      <rect x="155" y="20" width="30" height="20" rx="12" fill="url(#goldGrad)" />
      <rect x="155" y="45" width="30" height="30" rx="2" fill="url(#goldGrad)" />
      <rect x="120" y="80" width="65" height="20" rx="2" fill="url(#goldGrad)" />
      <rect x="120" y="105" width="30" height="30" rx="2" fill="url(#goldGrad)" />
      <rect x="155" y="105" width="30" height="30" rx="15" fill="url(#goldGrad)" />
      {/* Decorative quarter circles */}
      <path d="M20 160 Q20 140 40 140" stroke="var(--wc-gold)" strokeOpacity="0.1" strokeWidth="2" fill="none" />
      <path d="M60 160 Q60 140 80 140" stroke="var(--wc-gold)" strokeOpacity="0.08" strokeWidth="2" fill="none" />
      <path d="M100 160 Q100 140 120 140" stroke="var(--wc-gold)" strokeOpacity="0.06" strokeWidth="2" fill="none" />
      <path d="M140 160 Q140 140 160 140" stroke="var(--wc-gold)" strokeOpacity="0.1" strokeWidth="2" fill="none" />
    </svg>
  );
}
