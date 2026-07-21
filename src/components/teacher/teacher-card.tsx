import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MediaThumb } from "@/components/ui/media";
import { StarValue } from "@/components/ui/rating";
import { formatNaira } from "@/lib/utils";
import type { Teacher } from "@/lib/mock";

/** Full teacher card used in Explore listings. */
export function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex gap-3.5">
        <Link
          href={`/teacher/${teacher.id}`}
          className="tap relative shrink-0"
          aria-label={teacher.name}
        >
          <Avatar name={teacher.name} size="lg" ring={teacher.isLive} />
          {teacher.isLive && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-danger px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white ring-2 ring-surface">
              Live
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/teacher/${teacher.id}`} className="tap min-w-0">
              <p className="truncate font-semibold text-fg">{teacher.name}</p>
              <p className="truncate text-[13px] text-fg-muted">
                {teacher.title}
              </p>
            </Link>
            <StarValue
              value={teacher.rating}
              count={teacher.reviewCount}
              className="shrink-0 text-[13px]"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {teacher.subjects.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-lg bg-elevated px-2 py-1 text-[11px] font-medium text-fg-muted"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3.5 flex items-center justify-between border-t border-border-soft/60 pt-3.5">
        <div>
          <p className="text-sm font-bold text-fg">
            {formatNaira(teacher.hourlyRate)}
            <span className="text-[12px] font-normal text-fg-faint">/hr</span>
          </p>
          {!teacher.isLive && teacher.nextSlotLabel && (
            <p className="text-[11px] text-fg-faint">
              Next: {teacher.nextSlotLabel}
            </p>
          )}
        </div>
        {teacher.isLive ? (
          <Link href={`/teacher/${teacher.id}`}>
            <Button size="sm" variant="success">
              Join Live
            </Button>
          </Link>
        ) : (
          <Link href={`/book/${teacher.id}`}>
            <Button size="sm">Book Session</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/** Compact teacher row used in Recommended lists. */
export function TeacherRow({ teacher }: { teacher: Teacher }) {
  return (
    <Link
      href={`/teacher/${teacher.id}`}
      className="tap flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
    >
      <Avatar name={teacher.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-fg">{teacher.name}</p>
        <p className="truncate text-[13px] text-fg-muted">{teacher.title}</p>
        <div className="mt-1 flex items-center gap-2 text-[12px]">
          <StarValue value={teacher.rating} className="text-[12px]" />
          <span className="text-fg-faint">•</span>
          <span className="font-semibold text-fg">
            {formatNaira(teacher.hourlyRate)}
            <span className="font-normal text-fg-faint">/hr</span>
          </span>
        </div>
      </div>
      <ChevronRight className="size-5 shrink-0 text-fg-faint" />
    </Link>
  );
}

/** Picture-forward card for the auto-scrolling Recommended rail. */
export function TeacherSpotlightCard({ teacher }: { teacher: Teacher }) {
  return (
    <Link
      href={`/teacher/${teacher.id}`}
      className="tap w-40 shrink-0 overflow-hidden rounded-card border border-border bg-surface"
    >
      <MediaThumb
        seed={teacher.id}
        icon={false}
        className="relative grid aspect-5/4 w-full place-items-center"
      >
        <Avatar name={teacher.name} size="xl" ring className="shadow-lg" />
        {teacher.isLive && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-danger px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            <span className="size-1 rounded-full bg-white" /> Live
          </span>
        )}
      </MediaThumb>
      <div className="p-3">
        <p className="truncate text-[13.5px] font-semibold text-fg">
          {teacher.name}
        </p>
        <p className="truncate text-[12px] text-fg-muted">
          {teacher.title || teacher.subjects[0] || "Professional"}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[12px]">
          <StarValue value={teacher.rating} className="text-[12px]" />
          <span className="truncate font-semibold text-fg">
            {formatNaira(teacher.hourlyRate)}
            <span className="font-normal text-fg-faint">/hr</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
