import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <Card className={cn("bg-white/70 backdrop-blur-md border border-white/20 shadow-xl shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {trend && (
          <p className={cn("text-xs mt-2 font-medium", trendUp ? "text-emerald-600" : "text-rose-600")}>
            {trend} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
