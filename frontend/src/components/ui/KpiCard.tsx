import { type ReactNode } from "react";

export interface KpiCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  delta: string;
  deltaPeriod: string;
  deltaType?: "positive" | "negative" | "neutral";
}

export const KpiCard = ({
  icon,
  title,
  value,
  delta,
  deltaPeriod,
  deltaType = "neutral",
}: KpiCardProps) => {
  const deltaColorClass =
    deltaType === "positive"
      ? "text-emerald-600"
      : deltaType === "negative"
        ? "text-rose-600"
        : "text-slate-600";

  const arrow =
    deltaType === "positive" ? "↑" : deltaType === "negative" ? "↓" : "";

  return (
    <div className="flex flex-col justify-between p-4.5 sm:p-5 transition-colors hover:bg-slate-50/50">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-2xs">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-0.5 text-2xl xl:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="flex items-center text-sm font-medium truncate">
          <span className={`font-semibold ${deltaColorClass}`}>
            {arrow ? `${arrow} ` : ""}
            {delta}
          </span>
          <span className="ml-1.5 text-slate-400 font-medium">{deltaPeriod}</span>
        </p>
      </div>
    </div>
  );
};
