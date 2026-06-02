import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "pink" | "cyan" | "orange" | "purple" | "none";
}

const glowMap = {
  pink: "shadow-[0_0_40px_-12px_rgba(255,126,179,0.55)]",
  cyan: "shadow-[0_0_40px_-12px_rgba(79,209,197,0.45)]",
  orange: "shadow-[0_0_40px_-12px_rgba(255,179,71,0.45)]",
  purple: "shadow-[0_0_40px_-12px_rgba(124,92,255,0.5)]",
  none: "",
};

export function GlassCard({
  children,
  className,
  glow = "none",
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl",
        glowMap[glow],
        className
      )}
    >
      {children}
    </div>
  );
}

export function GlassButton({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-accent-purple to-accent-pink text-white hover:opacity-90",
    ghost: "border border-white/15 bg-white/5 hover:bg-white/10",
    danger: "bg-rose-500/20 border border-rose-400/30 text-rose-200 hover:bg-rose-500/30",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-white/60">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: "HEALTHY" | "SUBHEALTHY" | "DANGEROUS" | string;
}) {
  const map = {
    HEALTHY: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    SUBHEALTHY: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    DANGEROUS: "bg-rose-500/20 text-rose-300 border-rose-400/30",
  } as const;

  const label = {
    HEALTHY: "健康",
    SUBHEALTHY: "亚健康",
    DANGEROUS: "危险",
  } as const;

  const key = status as keyof typeof map;

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        map[key] ?? "bg-white/10 text-white/70 border-white/20"
      )}
    >
      {label[key as keyof typeof label] ?? status}
    </span>
  );
}
