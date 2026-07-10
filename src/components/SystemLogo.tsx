import { cn } from "@/lib/utils";
import {
  APP_NAME,
  APP_TAGLINE,
  DEV_COMPANY_SHORT,
  DEV_TAGLINE,
  LOGO_FILE,
} from "@/lib/branding";

interface SystemLogoProps {
  variant?: "icon" | "compact" | "full";
  className?: string;
  imageClassName?: string;
  dark?: boolean;
}

export function SystemLogo({
  variant = "compact",
  className,
  imageClassName,
  dark = false,
}: SystemLogoProps) {
  const logoSrc = `${import.meta.env.BASE_URL}${LOGO_FILE}`;

  if (variant === "icon") {
    return (
      <img
        src={logoSrc}
        alt={DEV_COMPANY_SHORT}
        className={cn("h-10 w-10 rounded-xl object-contain bg-white", imageClassName, className)}
      />
    );
  }

  if (variant === "full") {
    return (
      <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
        <img
          src={logoSrc}
          alt={DEV_COMPANY_SHORT}
          className={cn("h-24 w-auto max-w-[220px] object-contain", imageClassName)}
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-black">{APP_NAME}</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
            {DEV_COMPANY_SHORT} · {DEV_TAGLINE}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <img
        src={logoSrc}
        alt={DEV_COMPANY_SHORT}
        className={cn("h-10 w-10 shrink-0 rounded-xl object-contain bg-white", imageClassName)}
      />
      <div className="min-w-0 text-right">
        <p className={cn("text-sm font-black leading-tight truncate", dark ? "text-white" : "")}>
          {APP_NAME}
        </p>
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest leading-none truncate",
            dark ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {APP_TAGLINE}
        </p>
      </div>
    </div>
  );
}
