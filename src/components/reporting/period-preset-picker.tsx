"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Granularity,
  getPeriodRange,
  navigatePeriodReference,
  formatDateISO,
} from "@/lib/reporting/period-range";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface PeriodPresetPickerProps {
  mode: "range" | "pointInTime";
  fiscalYearStartMonth?: number;
  fiscalYearStartDay?: number;
}

export function PeriodPresetPicker({
  mode,
  fiscalYearStartMonth = 1,
  fiscalYearStartDay = 1,
}: PeriodPresetPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeGranularity = (searchParams.get("granularity") as Granularity | "custom") || "month";
  const rawRefDate = searchParams.get("referenceDate");
  const referenceDate = React.useMemo(
    () => (rawRefDate ? new Date(rawRefDate) : new Date()),
    [rawRefDate],
  );

  const [customStartDate, setCustomStartDate] = React.useState(searchParams.get("startDate") || "");
  const [customEndDate, setCustomEndDate] = React.useState(searchParams.get("endDate") || searchParams.get("asOfDate") || "");

  const updateURL = (paramsToUpdate: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(paramsToUpdate).forEach(([k, v]) => {
      if (v === null) params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectGranularity = (g: Granularity | "custom") => {
    if (g === "custom") {
      updateURL({ granularity: "custom" });
      return;
    }

    const { startDate, endDate } = getPeriodRange(
      g,
      referenceDate,
      fiscalYearStartMonth,
      fiscalYearStartDay,
    );

    const startStr = formatDateISO(startDate);
    const endStr = formatDateISO(endDate);

    if (mode === "pointInTime") {
      updateURL({
        granularity: g,
        asOfDate: endStr,
        startDate: null,
        endDate: null,
      });
    } else {
      updateURL({
        granularity: g,
        startDate: startStr,
        endDate: endStr,
        asOfDate: null,
      });
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (activeGranularity === "custom") return;

    const nextRef = navigatePeriodReference(activeGranularity as Granularity, referenceDate, direction);
    const nextRefStr = formatDateISO(nextRef);

    const { startDate, endDate } = getPeriodRange(
      activeGranularity as Granularity,
      nextRef,
      fiscalYearStartMonth,
      fiscalYearStartDay,
    );

    const startStr = formatDateISO(startDate);
    const endStr = formatDateISO(endDate);

    if (mode === "pointInTime") {
      updateURL({
        referenceDate: nextRefStr,
        asOfDate: endStr,
      });
    } else {
      updateURL({
        referenceDate: nextRefStr,
        startDate: startStr,
        endDate: endStr,
      });
    }
  };

  const handleApplyCustom = () => {
    if (mode === "pointInTime") {
      updateURL({
        granularity: "custom",
        asOfDate: customEndDate,
        startDate: null,
        endDate: null,
      });
    } else {
      updateURL({
        granularity: "custom",
        startDate: customStartDate,
        endDate: customEndDate,
        asOfDate: null,
      });
    }
  };

  const presets: { id: Granularity | "custom"; label: string }[] = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "quarter", label: "Quarter" },
    { id: "semester", label: "Semester" },
    { id: "year", label: "Year" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-border/80 bg-card shadow-xs">
      {/* Preset Buttons */}
      <div className="flex items-center p-1 bg-muted/50 rounded-xl border border-border/40">
        {presets.map((p) => {
          const isActive = activeGranularity === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectGranularity(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Prev / Next Navigation Arrows for Granularities */}
      {activeGranularity !== "custom" && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => handleNavigate("prev")}
            title="Previous Period"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => handleNavigate("next")}
            title="Next Period"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Custom Date Inputs */}
      {activeGranularity === "custom" && (
        <div className="flex items-center gap-2 text-xs animate-in fade-in duration-200">
          {mode === "range" ? (
            <>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">As of:</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
          )}
          <Button size="sm" className="h-8 px-3 text-xs" onClick={handleApplyCustom}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
