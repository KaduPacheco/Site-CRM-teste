import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

const DashboardSection = ({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: DashboardSectionProps) => {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/70 bg-muted/30 px-6 py-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("p-6", contentClassName)}>{children}</div>
    </section>
  );
};

export default DashboardSection;
