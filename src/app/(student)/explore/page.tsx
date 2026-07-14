"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/sheet";
import { TeacherCard } from "@/components/teacher/teacher-card";
import { topics } from "@/lib/mock";
import { useApp } from "@/lib/store/app-provider";
import { cn } from "@/lib/utils";

const TOPIC_KEYWORDS: Record<string, string[]> = {
  "further-maths": ["math", "calculus", "algebra", "trigon"],
  physics: ["physic", "mechanic", "wave", "optic"],
  chemistry: ["chem"],
  economics: ["econ", "business", "account"],
  coding: ["cod", "python", "software", "algorithm", "data", "web", "api"],
  english: ["english", "literat"],
  biology: ["bio"],
};

const RATING_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "4.5+", value: 4.5 },
  { label: "4.8+", value: 4.8 },
  { label: "5.0", value: 5 },
];

const PRICE_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "≤ ₦10,000", value: 10000 },
  { label: "≤ ₦15,000", value: 15000 },
];

const AVAIL_OPTIONS = [
  { label: "Any", value: "any" },
  { label: "Live now", value: "live" },
  { label: "Scheduled", value: "scheduled" },
] as const;

type Availability = (typeof AVAIL_OPTIONS)[number]["value"];

const SORT_OPTIONS = [
  { label: "Top rated", value: "rating" },
  { label: "Lowest price", value: "price-asc" },
  { label: "Highest price", value: "price-desc" },
] as const;

type Sort = (typeof SORT_OPTIONS)[number]["value"];

export default function ExplorePage() {
  const { teachers: allTeachers } = useApp();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [ratingMin, setRatingMin] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [liveOnly, setLiveOnly] = useState(false);
  const [availability, setAvailability] = useState<Availability>("any");
  const [sort, setSort] = useState<Sort>("rating");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters =
    (ratingMin > 0 ? 1 : 0) +
    (maxPrice > 0 ? 1 : 0) +
    (availability !== "any" ? 1 : 0) +
    (sort !== "rating" ? 1 : 0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const keywords = TOPIC_KEYWORDS[topic];

    const filtered = allTeachers.filter((t) => {
      const haystack = [t.name, t.title, ...t.subjects, ...t.expertise]
        .join(" ")
        .toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (keywords && !keywords.some((k) => haystack.includes(k))) return false;
      if (ratingMin && t.rating < ratingMin) return false;
      if (maxPrice && t.hourlyRate > maxPrice) return false;
      if (liveOnly && !t.isLive) return false;
      if (availability === "live" && !t.isLive) return false;
      if (availability === "scheduled" && t.isLive) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.hourlyRate - b.hourlyRate;
      if (sort === "price-desc") return b.hourlyRate - a.hourlyRate;
      return b.rating - a.rating;
    });
  }, [
    allTeachers,
    query,
    topic,
    ratingMin,
    maxPrice,
    liveOnly,
    availability,
    sort,
  ]);

  const resetFilters = () => {
    setRatingMin(0);
    setMaxPrice(0);
    setAvailability("any");
    setSort("rating");
  };

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 bg-canvas/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <h1 className="mb-3 font-display text-2xl font-bold tracking-tight text-fg">
          Explore Professionals
        </h1>
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-surface px-4">
          <Search className="size-5 shrink-0 text-fg-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, skills or professionals"
            className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="tap text-fg-faint"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </header>

      <div className="no-scrollbar mt-1 flex gap-2 overflow-x-auto px-5 pb-1 pt-2">
        {topics.map((t) => (
          <Chip
            key={t.id}
            selected={topic === t.id}
            onClick={() => setTopic(t.id)}
          >
            {t.label}
          </Chip>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2 px-5">
        <Chip selected={liveOnly} onClick={() => setLiveOnly((v) => !v)}>
          <span
            className={cn(
              "size-1.5 rounded-full",
              liveOnly ? "bg-white" : "bg-danger",
            )}
          />
          Live now
        </Chip>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="tap inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-fg-muted active:scale-[0.98]"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilters > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      <div className="mt-4 px-5">
        <p className="mb-3 text-[13px] text-fg-muted">
          {results.length}{" "}
          {results.length === 1 ? "professional" : "professionals"} available
        </p>
        <div className="space-y-3">
          {results.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
          {results.length === 0 && (
            <div className="rounded-card border border-dashed border-border-soft py-12 text-center">
              <p className="font-semibold text-fg">No professionals found</p>
              <p className="mt-1 text-[13px] text-fg-muted">
                Try a different search or adjust your filters.
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
      >
        <div className="space-y-6">
          <FilterGroup label="Minimum rating">
            {RATING_OPTIONS.map((o) => (
              <Chip
                key={o.label}
                selected={ratingMin === o.value}
                onClick={() => setRatingMin(o.value)}
              >
                {o.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Max hourly rate">
            {PRICE_OPTIONS.map((o) => (
              <Chip
                key={o.label}
                selected={maxPrice === o.value}
                onClick={() => setMaxPrice(o.value)}
              >
                {o.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Availability">
            {AVAIL_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                selected={availability === o.value}
                onClick={() => setAvailability(o.value)}
              >
                {o.label}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Sort by">
            {SORT_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                selected={sort === o.value}
                onClick={() => setSort(o.value)}
              >
                {o.label}
              </Chip>
            ))}
          </FilterGroup>
        </div>
        <div className="mt-7 flex gap-3">
          <Button variant="neutral" fullWidth onClick={resetFilters}>
            Reset
          </Button>
          <Button fullWidth onClick={() => setFiltersOpen(false)}>
            Show {results.length} {results.length === 1 ? "result" : "results"}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-[13px] font-semibold text-fg-muted">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
