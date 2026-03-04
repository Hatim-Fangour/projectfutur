"use client";

import {
  Axe,
  CalendarArrowUp,
  Goal,
  GraduationCap,
  HouseHeart,
  Megaphone,
  PiggyBank,
  Plus,
  Siren,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FundForm from "./FundForm";

const SavingsGoals = () => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    category: "equipment",
  });

  const savingsGoals = [
    {
      id: 1,
      title: "New Massage Equipment",
      description: "Professional massage tables and aromatherapy diffusers",
      targetAmount: 15000,
      currentAmount: 8500,
      deadline: new Date("2025-12-31"),
      category: "equipment",
      priority: "high",
      monthlyTarget: 1083,
      icon: <Axe />,
    },
    {
      id: 2,
      title: "Emergency Fund",
      description: "6 months of operating expenses",
      targetAmount: 50000,
      currentAmount: 32000,
      deadline: new Date("2026-06-30"),
      category: "emergency",
      priority: "high",
      monthlyTarget: 2250,
      icon: <Siren />,
    },
    {
      id: 3,
      title: "Spa Renovation",
      description: "Refresh interior design and upgrade facilities",
      targetAmount: 25000,
      currentAmount: 5200,
      deadline: new Date("2026-03-15"),
      category: "renovation",
      priority: "medium",
      monthlyTarget: 1485,
      icon: <HouseHeart />,
    },
    {
      id: 4,
      title: "Staff Training Program",
      description: "Advanced certification courses for therapists",
      targetAmount: 8000,
      currentAmount: 2800,
      deadline: new Date("2025-08-30"),
      category: "training",
      priority: "medium",
      monthlyTarget: 577,
      icon: <GraduationCap />,
    },
    {
      id: 5,
      title: "Marketing Campaign",
      description: "Annual marketing budget for growth",
      targetAmount: 12000,
      currentAmount: 7200,
      deadline: new Date("2025-12-01"),
      category: "marketing",
      priority: "low",
      monthlyTarget: 480,
      icon: <Megaphone />,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    })?.format(amount);
  };

  const formatDate = (date: any) => {
    return date?.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateProgress = (current: any, target: any) => {
    return Math.min((current / target) * 100, 100);
  };
  const getDaysRemaining = (deadline: Date | string): number => {
    // ensure 'deadline' is a Date object
    const deadlineDate =
      typeof deadline === "string" ? new Date(deadline) : deadline;

    // if invalid date, return 0 or handle gracefully
    if (isNaN(deadlineDate.getTime())) return 0;

    const today = new Date();

    // calculate difference in milliseconds
    const timeDiff = deadlineDate.getTime() - today.getTime();

    // convert to full days
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff;
  };

  const getPriorityColor = (priority: any) => {
    switch (priority) {
      case "high":
        return "bg-error text-error-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (progress: any) => {
    if (progress >= 90) return "#1cbd00";
    if (progress >= 70) return "#005ebd";
    if (progress >= 50) return "#bd8400";
    return "#c60202";
  };



  const handleAddGoal = (e: any) => {
    e?.preventDefault();
    // Handle adding new goal logic here
    console.log("New goal:", newGoal);
    setShowAddGoal(false);
    setNewGoal({
      title: "",
      targetAmount: "",
      deadline: "",
      category: "equipment",
    });
  };

  const totalSavingsTarget = savingsGoals?.reduce(
    (sum, goal) => sum + goal?.targetAmount,
    0
  );
  const totalCurrentSavings = savingsGoals?.reduce(
    (sum, goal) => sum + goal?.currentAmount,
    0
  );
  const totalProgress = (totalCurrentSavings / totalSavingsTarget) * 100;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Savings */}
        <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Total Savings
              </h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(totalCurrentSavings)}
              </p>
            </div>

            <div className="p-3 bg-primary/10 rounded-lg">
              <PiggyBank size={35} />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(totalSavingsTarget - totalCurrentSavings)} remaining
          </div>
        </div>

        {/* Total Goals */}
        <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Total Goals
              </h3>
              <p className="text-2xl font-bold text-accent mt-1">
                {savingsGoals?.length}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Goal size={35} />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Active savings goals
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Overall Progress
              </h3>
              <p className="text-2xl font-bold text-success mt-1">
                {totalProgress?.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp size={35} />
            </div>
          </div>
          <div className="mt-8 w-full flex items-center">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full "
                style={{
                  width: `${totalProgress}%`,
                  backgroundColor: "#11ff00",
                }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Target */}
        <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Monthly Target
              </h3>
              <p className="text-2xl font-bold text-warning mt-1">
                {formatCurrency(
                  savingsGoals?.reduce(
                    (sum, goal) => sum + goal?.monthlyTarget,
                    0
                  )
                )}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <CalendarArrowUp size={35} />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Combined monthly savings
          </div>
        </div>
      </div>

      {/* Add New Goal Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground">Savings Goals</h3>

        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowAddGoal(true)} variant="outline">
              <Plus name="Plus" size={16} />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <FundForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {savingsGoals?.map((goal) => {
          const progress = calculateProgress(
            goal?.currentAmount,
            goal?.targetAmount
          );
          const daysRemaining = getDaysRemaining(goal?.deadline);
          const isOverdue = daysRemaining < 0;

          return (
            <div
              key={goal?.id}
              className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {goal.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      {goal?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {goal?.description}
                    </p>
                  </div>
                </div>
                <Badge variant="destructive">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                      goal?.priority
                    )}`}
                  >
                    {goal?.priority?.toUpperCase()}
                  </span>
                </Badge>
              </div>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(goal?.currentAmount)} /{" "}
                    {formatCurrency(goal?.targetAmount)}
                  </span>

                  <span
                    className="text-sm font-semibold"
                    style={{ color: getProgressColor(progress) }}
                  >
                    {progress?.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-8 w-full flex items-center">
                 
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${progress}%`,
                        // width: `26%`,
                        backgroundColor: getProgressColor(progress),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Goal Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="font-semibold text-foreground">
                    {formatCurrency(goal?.targetAmount - goal?.currentAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Monthly Target
                  </div>
                  <div className="font-semibold text-foreground">
                    {formatCurrency(goal?.monthlyTarget)}
                  </div>
                </div>
              </div>

              {/* Deadline Info */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  {/* <Icon name="Calendar" size={16} className="text-muted-foreground" /> */}
                  <span className="text-sm text-muted-foreground">
                    Deadline: {formatDate(goal?.deadline)}
                  </span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${
                    isOverdue ? "text-error" : "text-muted-foreground"
                  }`}
                >
                  {/* <Icon name="Clock" size={16} /> */}
                  <span className="text-sm font-medium">
                    {isOverdue
                      ? `${Math.abs(daysRemaining)} days overdue`
                      : `${daysRemaining} days left`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4">
                <Button className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 spa-transition text-sm font-medium">
                  Add Funds
                </Button>
                <Button className="flex-1 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 spa-transition text-sm font-medium">
                  Edit Goal
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
    </div>
  );
};

export default SavingsGoals;
