import Link from "next/link";
import { Eye } from "lucide-react";
import { MediaThumb } from "@/components/ui/media";
import { Badge } from "@/components/ui/badge";
import { formatCompact } from "@/lib/utils";
import type { LiveNowItem } from "@/lib/mock";

/** Live session card for the Home "Live Now" carousel. */
export function LiveNowCard({ item }: { item: LiveNowItem }) {
  return (
    <Link
      href={`/live/${item.id}?as=student`}
      className="tap block w-62 shrink-0"
    >
      <MediaThumb seed={item.id} className="h-36 rounded-2xl">
        <Badge variant="live" dot uppercase className="absolute left-3 top-3">
          Live
        </Badge>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          <Eye className="size-3.5" />
          {formatCompact(item.viewers)}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate text-sm font-semibold text-white">
            {item.topic}
          </p>
          <p className="truncate text-[12px] text-white/70">
            {item.teacherName} · {item.tag}
          </p>
        </div>
      </MediaThumb>
    </Link>
  );
}
