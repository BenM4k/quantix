export type Granularity = "week" | "month" | "quarter" | "semester" | "year";

export interface PeriodRangeResult {
  startDate: Date;
  endDate: Date;
}

/**
 * Format a Date object to YYYY-MM-DD string without timezone drift.
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Pure date calculation for report period presets.
 * Supports calendar weeks, months, quarters, semesters, and fiscal years.
 */
export function getPeriodRange(
  granularity: Granularity,
  referenceDate: Date,
  fiscalYearStartMonth: number = 1, // 1-12
  fiscalYearStartDay: number = 1,   // 1-28
): PeriodRangeResult {
  const ref = new Date(referenceDate);

  if (granularity === "week") {
    // Calendar week (Monday - Sunday)
    const day = ref.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const startDate = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + diffToMonday);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
    return { startDate, endDate };
  }

  if (granularity === "month") {
    // Calendar month containing referenceDate
    // Assumption: Fiscal periods effectively align to month boundaries in practice for standard business configurations.
    const startDate = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const endDate = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    return { startDate, endDate };
  }

  // For fiscal-year relative granularities (quarter, semester, year):
  // Find the anchor date for the fiscal year containing referenceDate.
  let anchorYear = ref.getFullYear();
  let anchorDate = new Date(anchorYear, fiscalYearStartMonth - 1, fiscalYearStartDay);

  // If referenceDate is before this year's anchor, the fiscal year started the previous year
  if (ref < anchorDate) {
    anchorYear -= 1;
    anchorDate = new Date(anchorYear, fiscalYearStartMonth - 1, fiscalYearStartDay);
  }

  if (granularity === "year") {
    const startDate = anchorDate;
    const nextAnchor = new Date(anchorYear + 1, fiscalYearStartMonth - 1, fiscalYearStartDay);
    const endDate = new Date(nextAnchor.getTime() - 86400000); // 1 day before next anchor
    return { startDate, endDate };
  }

  if (granularity === "quarter") {
    // 3-month blocks from anchorDate
    // Determine which 3-month block ref falls into
    let blockStart = new Date(anchorDate);
    while (true) {
      const nextBlockStart = new Date(blockStart.getFullYear(), blockStart.getMonth() + 3, blockStart.getDate());
      if (ref >= blockStart && ref < nextBlockStart) {
        const endDate = new Date(nextBlockStart.getTime() - 86400000);
        return { startDate: blockStart, endDate };
      }
      blockStart = nextBlockStart;
    }
  }

  if (granularity === "semester") {
    // 6-month blocks from anchorDate
    let blockStart = new Date(anchorDate);
    while (true) {
      const nextBlockStart = new Date(blockStart.getFullYear(), blockStart.getMonth() + 6, blockStart.getDate());
      if (ref >= blockStart && ref < nextBlockStart) {
        const endDate = new Date(nextBlockStart.getTime() - 86400000);
        return { startDate: blockStart, endDate };
      }
      blockStart = nextBlockStart;
    }
  }

  // Default fallback to month
  const startDate = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const endDate = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { startDate, endDate };
}

/**
 * Navigate to previous or next instance of the given granularity.
 */
export function navigatePeriodReference(
  granularity: Granularity,
  currentReferenceDate: Date,
  direction: "prev" | "next",
): Date {
  const date = new Date(currentReferenceDate);
  const factor = direction === "next" ? 1 : -1;

  switch (granularity) {
    case "week":
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7 * factor);
    case "month":
      return new Date(date.getFullYear(), date.getMonth() + factor, date.getDate());
    case "quarter":
      return new Date(date.getFullYear(), date.getMonth() + 3 * factor, date.getDate());
    case "semester":
      return new Date(date.getFullYear(), date.getMonth() + 6 * factor, date.getDate());
    case "year":
      return new Date(date.getFullYear() + factor, date.getMonth(), date.getDate());
    default:
      return date;
  }
}
