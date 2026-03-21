type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, { width: number; height: number; barClass: string }> = {
  sm: { width: 80, height: 24, barClass: 'h-0.5 -bottom-0.5' },
  md: { width: 160, height: 48, barClass: 'h-1 -bottom-1' },
  lg: { width: 220, height: 64, barClass: 'h-1.5 -bottom-1.5' },
};

interface LogoLoaderProps {
  size?: Size;
  className?: string;
  /** Shown under the logo — use on key pages (e.g. marketplace) so loading is obvious */
  label?: string;
  /** Stronger bar + logo contrast (hero / marketplace) */
  prominent?: boolean;
}

/**
 * Single shared loader: Sigag logo + bar, heartbeat animation.
 * Use everywhere so the app has one consistent loading look.
 * Uses <img> to avoid next/image client-boundary issues in loader context.
 */
export default function LogoLoader({ size = 'md', className = '', label, prominent = false }: LogoLoaderProps) {
  const { width, height, barClass } = sizes[size];
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      aria-label={label || 'Loading'}
      role="status"
    >
      <div className={`relative animate-heartbeat origin-center ${prominent ? 'drop-shadow-[0_0_20px_rgba(61,90,128,0.35)]' : ''}`}>
        <img
          src="/assets/sigaglogo.svg"
          alt=""
          width={width}
          height={height}
          className={`sigag-logo sigag-logo-on-solid ${prominent ? 'opacity-100' : 'opacity-90'}`}
          fetchPriority="high"
        />
        <div
          className={`absolute left-0 right-0 overflow-hidden rounded-full border border-[var(--border-subtle)] ${barClass} ${
            prominent ? 'bg-[var(--bg-input)]' : 'bg-[var(--bg-elevated)]'
          }`}
        >
          <div
            className={`h-full w-1/3 rounded-full animate-loader-bar ${
              prominent
                ? 'bg-gradient-to-r from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] shadow-[0_0_12px_rgba(61,90,128,0.6)]'
                : 'bg-[var(--accent-solid)]'
            }`}
          />
        </div>
      </div>
      {label ? (
        <p className="text-center text-sm sm:text-base font-semibold tracking-tight text-[var(--text-primary)] animate-pulse">
          {label}
        </p>
      ) : null}
    </div>
  );
}
