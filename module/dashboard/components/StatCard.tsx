import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="shadow-sm border-gray-400/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p
              className={`text-xs font-medium ${
                changeType === "positive"
                  ? "text-success"
                  : changeType === "negative"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {change}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
