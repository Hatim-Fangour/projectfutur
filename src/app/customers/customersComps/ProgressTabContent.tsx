"use client";

import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import TreatmentCarousel from "./TreatmentCarousel";
import { Expand } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ExpendedProgressTabContent from "./ExpendedProgressTabContent";
import {
  Customer,
  CustomerProgressSessionType,
} from "@/app/customers/types/customers";
import { TabContentProps } from "@/app/customers/Interfaces/customerInterfaces";
import { formatDate, getSessionStatusColor } from "../utils/helpers";

const ProgressTabContent = ({ customer }: TabContentProps) => {
  const [selectedSession, setSelectedSession] = useState<string>("1");
  console.log({ customer });
  // Mock data with enhanced treatment information
  const sessions = customer.progress || [];

  const currentSession =
    sessions.find((s) => s.id === selectedSession) || sessions[0];

  return (
    <div className="relative ">
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
                  className={`w-full text-left p-3 rounded-lg transition-all border ${
                    selectedSession === session.id
                      ? "border bg-neutral-800"
                      : "border bg-muted/1 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-foreground">
                      {session?.type}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getSessionStatusColor(
                        session?.status
                      )}`}
                    >
                      {session?.status.charAt(0).toUpperCase() +
                        session?.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(session?.date, "short")}
                    </span>
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${session?.progress}%` }}
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
          {currentSession && (
            <Card className="border-accent/20 bg-card/50 backdrop-blur overflow-hidden">
              <CardHeader>
                {/* Progress Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{currentSession.type}</CardTitle>
                    <CardDescription>
                      Treatment from {formatDate(currentSession.date, "short")}
                    </CardDescription>
                  </div>
                  <Badge
                    className={getSessionStatusColor(currentSession.status)}
                  >
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
                      className="h-full bg-linear-to-r from-accent to-accent/60 transition-all duration-500"
                      style={{ width: `${currentSession.progress}%` }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TreatmentCarousel session={currentSession} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <div className="sticky bottom-0 w-6 left-0 cursor-pointer">
            <Expand />
          </div>
        </DialogTrigger>
        <DialogContent className="w-[95%]! h-[95%]! max-w-full!">
          <ExpendedProgressTabContent />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgressTabContent;
