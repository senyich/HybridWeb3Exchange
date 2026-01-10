import { Skeleton } from "./Skeleton";

interface StatRowProps {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
  isLoading?: boolean;
}

export const StatRow = ({
  label,
  value,
  unit,
  highlight = false,
  isLoading = false,
}: StatRowProps) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group">
    <span className="text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors">
      {label}
    </span>
    <div className="flex items-center gap-2 font-mono">
      {isLoading ? (
        <Skeleton className="w-24 h-6" />
      ) : (
        <>
          <span
            className={`text-lg tracking-tight ${
              highlight
                ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-crimson-neon font-bold"
                : "text-gray-200"
            }`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs text-gray-600 uppercase font-bold mt-1">
              {unit}
            </span>
          )}
        </>
      )}
    </div>
  </div>
);