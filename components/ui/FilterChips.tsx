"use client";

export type FilterOption = "All" | "Past Champions" | "Dark Horses" | "LIV Golfers" | "Major Winners";

interface FilterChipsProps {
  active: FilterOption;
  onChange: (filter: FilterOption) => void;
}

const filters: FilterOption[] = [
  "All",
  "Past Champions",
  "Major Winners",
  "Dark Horses",
  "LIV Golfers",
];

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => {
        const isActive = active === filter;
        return (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-masters-green text-white"
                : "border border-[var(--border-color)] bg-white text-[var(--text-secondary)] hover:border-masters-green hover:text-masters-green"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
