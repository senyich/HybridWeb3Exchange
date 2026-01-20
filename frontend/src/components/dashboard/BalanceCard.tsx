import type { LucideIcon } from "lucide-react";
import { Card } from "../Card";
import { Skeleton } from "../Skeleton";

interface BalanceCardProps {
  title: string;
  value: string | null;
  unit: string;
  icon: LucideIcon;
  isLoading: boolean;
  iconColor: string;
  iconBgColor: string;
  iconBorderColor: string;
  valueColor?: string;
  labelColor?: string;
  tag?: string;
}

export const BalanceCard = ({
  title,
  value,
  unit,
  icon: Icon,
  isLoading,
  iconColor,
  iconBgColor,
  iconBorderColor,
  valueColor = "text-white",
  labelColor = "text-gray-300/50",
  tag = "Wallet",
}: BalanceCardProps) => {
  return (
    <Card className="flex flex-col justify-between h-full group">
      <div className="flex items-start justify-between mb-6">
        <div
          className={`p-3 ${iconBgColor} rounded-xl border ${iconBorderColor} group-hover:${iconBorderColor.replace(
            "/20",
            "/40"
          )} transition-colors`}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
          {tag}
        </span>
      </div>
      <div className="space-y-2">
        {isLoading ? (
          <Skeleton className="w-32 h-10" />
        ) : (
          <div className={`text-4xl font-mono ${valueColor} tracking-tight font-medium`}>
            {value}
          </div>
        )}
        <div className={`text-xs uppercase font-bold tracking-wider pl-0.5 ${labelColor}`}>
          {unit} {title}
        </div>
      </div>
    </Card>
  );
};