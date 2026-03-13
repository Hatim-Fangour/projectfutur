"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TreatmentCarousel from "./TreatmentCarousel";
import { Expand } from "lucide-react";

const ExpendedProgressTabContent = () => {
  const [selectedSession, setSelectedSession] = useState<string>("1");

  // Mock data with enhanced treatment information
  const sessions = [
    {
      id: "1",
      date: "2024-11-13",
      type: "Full Body Massage & Facial",
      status: "completed",
      beforeImage: "/spa-customer-before-treatment-massage-relaxation.jpg",
      afterImage: "/spa-customer-after-treatment-glowing-radiant-skin.jpg",
      duringImages: [
        {
          url: "/spa-treatment-in-progress-massage-therapy.jpg",
          caption: "Full body massage",
          timestamp: "5 min",
        },
        {
          url: "/facial-treatment-spa-relaxation-session.jpg",
          caption: "Facial treatment application",
          timestamp: "15 min",
        },
      ],
      products: [
        "Hydrating Face Serum",
        "Premium Body Oil",
        "Anti-aging Face Cream",
        "Organic Lavender Extract",
      ],
      notes:
        "Excellent results! Skin texture improved significantly. Client reported feeling very relaxed.",
      progress: 100,
      therapist: "Sarah Johnson",
      duration: "90 minutes",
    },
    {
      id: "2",
      date: "2024-11-06",
      type: "Intensive Skincare Treatment",
      status: "completed",
      beforeImage: "/spa-customer-skin-before-treatment.jpg",
      afterImage: "/spa-customer-skin-after-treatment-brightened.jpg",
      duringImages: [
        {
          url: "/skincare-treatment-application-spa.jpg",
          caption: "Skincare treatment application",
          timestamp: "20 min",
        },
      ],
      products: ["Vitamin C Serum", "Hydrating Mask", "Skin Brightening Cream"],
      notes:
        "Second session showing cumulative benefits. Hydration level improved.",
      progress: 100,
      therapist: "Emma Davis",
      duration: "60 minutes",
    },
    {
      id: "3",
      date: "2024-11-15",
      type: "Anti-Aging Spa Package",
      status: "in-progress",
      beforeImage: "/spa-customer-before-anti-aging-treatment.jpg",
      afterImage: "/spa-customer-during-anti-aging-treatment-process.jpg",
      duringImages: [
        {
          url: "/anti-aging-treatment-spa-session.jpg",
          caption: "Anti-aging treatment",
          timestamp: "10 min",
        },
      ],
      products: ["Retinol Night Cream", "Collagen Serum", "Eye Contour Cream"],
      notes: "Treatment in progress. Great response from client so far.",
      progress: 60,
      therapist: "Michael Chen",
      duration: "120 minutes",
    },
  ];

  const currentSession =
    sessions.find((s) => s.id === selectedSession) || sessions[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "in-progress":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "upcoming":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Session Selector */}
        <div className="lg:col-span-1">
          <Card className="border-accent/20 bg-card/50 backdrop-blur p-2">
            <CardHeader className="px-3">
              <CardTitle className="text-lg">Sessions</CardTitle>
              <CardDescription>Your treatment history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                    selectedSession === session.id
                      ? "border-accent bg-accent/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-foreground">
                      {session.type}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(session.status)}`}
                    >
                      {session.status.charAt(0).toUpperCase() +
                        session.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {session.date}
                    </span>
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${session.progress}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-accent/20 bg-card/50 backdrop-blur overflow-hidden">
            <CardHeader>
              {/* Progress Header */}
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{currentSession.type}</CardTitle>
                  <CardDescription>
                    Treatment from {currentSession.date}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(currentSession.status)}>
                  {currentSession.status.charAt(0).toUpperCase() +
                    currentSession.status.slice(1)}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Overall Progress
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {currentSession.progress}%
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-500"
                    style={{ width: `${currentSession.progress}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TreatmentCarousel session={currentSession} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpendedProgressTabContent;
