import { Pill } from "lucide-react";
import { Badge } from "./ui/badge";

interface MedicineBadgeProps {
  name: string;
}

export function MedicineBadge({ name }: MedicineBadgeProps) {
  return (
    <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200">
      <Pill className="mr-2 h-4 w-4 text-slate-500" />
      {name}
    </Badge>
  );
}
