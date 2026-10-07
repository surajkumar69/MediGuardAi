import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "High" | "Moderate" | "Low";
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const variants = {
    High: "destructive",
    Moderate: "warning",
    Low: "success",
  } as const;

  return (
    <Badge variant={variants[level]} className={cn("px-3 py-1 text-sm shadow-sm", className)}>
      {level} Risk
    </Badge>
  );
}
