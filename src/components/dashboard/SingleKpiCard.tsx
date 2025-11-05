"use client"
import { Card, CardContent, CardHeader } from "../ui/card";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

const SingleKpiCard = ({
  title,
  value,
  change,
  isPositive,
  icon,
}: KPICardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          </div>
          <div className="p-3 rounded-md bg-primary/10 text-2xl">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={`text-xs font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "↑" : "↓"} {change}
        </p>
      </CardContent>
    </Card>
  );
};

export default SingleKpiCard;
