// Reusable skeleton loading component (Point 10)
import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonList({ rows = 5, cols = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}