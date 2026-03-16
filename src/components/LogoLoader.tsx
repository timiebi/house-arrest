type Size = 'sm' | 'md';

const sizes: Record<Size, { width: number; height: number }> = {
  sm: { width: 80, height: 24 },
  md: { width: 160, height: 48 },
};

interface LogoLoaderProps {
  size?: Size;
  className?: string;
}

/**
 * Single shared loader: Sigag logo + bar, heartbeat animation.
 * Use everywhere so the app has one consistent loading look.
 * Uses <img> to avoid next/image client-boundary issues in loader context.
 */
export default function LogoLoader({ size = 'md', className = '' }: LogoLoaderProps) {
  const { width, height } = sizes[size];
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`} aria-label="Loading" role="status">
      <div className="relative animate-heartbeat origin-center">
        <img
          src="/assets/sigaglogo.svg"
          alt=""
          width={width}
          height={height}
          className="sigag-logo sigag-logo-on-solid opacity-90"
          fetchPriority="high"
        />
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          <div className="h-full w-1/3 rounded-full bg-[var(--accent-solid)] animate-loader-bar" />
        </div>
      </div>
    </div>
  );
}
