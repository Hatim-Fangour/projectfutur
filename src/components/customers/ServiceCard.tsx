import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

const ServiceCard = ({ service }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return {
          badge:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
          icon: CheckCircle2,
          color: "text-emerald-600",
        };
      case "expiring-soon":
        return {
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
          icon: Clock,
          color: "text-amber-600",
        };
      case "expired":
        return {
          badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          icon: AlertCircle,
          color: "text-red-600",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-800",
          icon: CheckCircle2,
          color: "text-gray-600",
        };
    }
  };

  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSessionPercentage = (remaining: number, total: number) => {
    return (remaining / total) * 100;
  };

  const { badge, icon: IconComponent, color } = getStatusColor(service.status);
  const daysRemaining = getDaysRemaining(service.expiryDate);
  const sessionPercentage = getSessionPercentage(
    service.remainingSessions,
    service.totalSessions
  );

  const statusInfo = getStatusColor("");
  return (
    <Card
      key={service.id}
      className="border transition-all hover:shadow-md dark:hover:bg-neutral-800 cursor-pointer group py-2"
    >
      <CardContent className="p-2 px-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {service.name}
                </h3>
                <Badge className={badge}>
                  {service.status.replace("-", " ").toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
            </div>
            <IconComponent className={`w-6 h-6 ${color}`} />
          </div>

          {/* Session Progress */}
          <div className="bg-accent/5 rounded-lg p- border border-accent/20">
            <div className="flex items-center justify-between mb-3 gap-8">
              {/* Sessions Remaining */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Sessions Remaining
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {service.remainingSessions}{" "}
                  <span className="text-lg text-muted-foreground">
                    / {service.totalSessions}
                  </span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="flex w-full flex-col">
                <Progress value={sessionPercentage} className="h-2 [&_[data-slot=progress-indicator]]:bg-blue-300" />
                <p className="text-xs text-muted-foreground mt-2">
                  {sessionPercentage.toFixed(0)}% sessions used
                </p>
              </div>

              {/* Used */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Used</p>
                <p className="text-lg font-semibold text-">
                  {service.totalSessions - service.remainingSessions}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-muted/30 rounded-lg p-3 border">
              <p className="text-muted-foreground mb-1">Type</p>
              <p className="font-medium text-foreground">{service.type}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border">
              <p className="text-muted-foreground mb-1">Purchase Date</p>
              <p className="font-medium text-foreground">
                {new Date(service.purchaseDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border">
              <p className="text-muted-foreground mb-1">Expiry Date</p>
              <p className="font-medium text-foreground">
                {new Date(service.expiryDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border">
              <p className="text-muted-foreground mb-1">Price</p>
              <p className="font-medium text-foreground">${service.price}</p>
            </div>
          </div>

          {/* Expiry Warning */}
          {service.status === "expiring-soon" && daysRemaining > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-semibold">
                  Expires in {daysRemaining} days
                </span>{" "}
                - Make sure to use your remaining sessions!
              </p>
            </div>
          )}

          {service.status === "expired" && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">
                <span className="font-semibold">This package has expired</span>{" "}
                - Consider renewing for continued benefits
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
