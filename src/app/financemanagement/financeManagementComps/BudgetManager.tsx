"use client";

import {
  ChartPie,
  House,
  Lightbulb,
  Megaphone,
  Minus,
  PackageOpen,
  Plus,
  Receipt,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  TrendingUpDown,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartConfig, ChartContainer } from "../../../components/ui/chart";
import { Button } from "../../../components/ui/button";

const BudgetManager = ({ timeRange }: any) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddBudget, setShowAddBudget] = useState(false);

  const categoryColors = {
    "Staff Salaries": "#dc2626", // Strong Red
    Rent: "#ea580c", // Orange
    Utilities: "#ca8a04", // Amber/Gold
    Supplies: "#16a34a", // Green
    Marketing: "#2563eb", // Blue
    Equipment: "#7c3aed", // Purple
    Other: "#64748b", // Slate Gray
  };
  const budgetData = [
    {
      category: "Staff Salaries",
      budgeted: 8000,
      actual: 8500,
      variance: -500,
      variancePercent: -6.3,
      icon: <Users size={35} />,
      color: "var(--color-2)",
      status: "over",
    },
    {
      category: "Utilities",
      budgeted: 2500,
      actual: 2300,
      variance: 200,
      variancePercent: 8.0,
      icon: <Lightbulb size={35} />,
      color: "var(--color-warning)",
      status: "under",
    },
    {
      category: "Supplies",
      budgeted: 2000,
      actual: 1800,
      variance: 200,
      variancePercent: 10.0,
      icon: <PackageOpen size={35} />,
      color: "var(--color-success)",
      status: "under",
    },
    {
      category: "Marketing",
      budgeted: 1000,
      actual: 1200,
      variance: -200,
      variancePercent: -20.0,
      icon: <Megaphone size={35} />,
      color: "var(--color-error)",
      status: "over",
    },
    {
      category: "Rent",
      budgeted: 2800,
      actual: 2800,
      variance: 0,
      variancePercent: 0.0,
      icon: <House size={35} />,
      color: "var(--color-accent)",
      status: "on-track",
    },
    {
      category: "Equipment",
      budgeted: 1200,
      actual: 900,
      variance: 300,
      variancePercent: 25.0,
      icon: <Settings size={36} />,
      color: "var(--color-secondary)",
      status: "under",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    })?.format(amount);
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "over":
        return "text-red-600";
      case "under":
        return "text-green-800";
      case "on-track":
        return "text-blue-400";
      default:
        return "text-pink-300";
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "over":
        return TrendingUp;
      case "under":
        return TrendingDown;
      case "on-track":
        return Target;
      default:
        return Minus;
    }
  };

  const getStatusLabel = (status: any) => {
    switch (status) {
      case "over":
        return "Over Budget";
      case "under":
        return "Under Budget";
      case "on-track":
        return "On Track";
      default:
        return "Unknown";
    }
  };

  const totalBudgeted = budgetData?.reduce(
    (sum, item) => sum + item?.budgeted,
    0
  );
  const totalActual = budgetData?.reduce((sum, item) => sum + item?.actual, 0);
  const totalVariance = totalBudgeted - totalActual;
  const totalVariancePercent = (totalVariance / totalBudgeted) * 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 spa-shadow-elevated">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              Budgeted: {formatCurrency(data?.budgeted)}
            </p>
            <p className="text-sm">Actual: {formatCurrency(data?.actual)}</p>
            <p
              className={`text-sm ${
                data?.variance >= 0 ? "text-success" : "text-error"
              }`}
            >
              Variance: {formatCurrency(Math.abs(data?.variance))}{" "}
              {data?.variance >= 0 ? "under" : "over"}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartConfig = {
    budgeted: {
      label: "Budgeted",
      color: "var(--chart-2)",
    },
    expenses: {
      label: "Expenses",
      color: "var(--chart-5)",
    },
    savings: {
      label: "Savings",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Budget */}
        <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Total Budget
              </h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(totalBudgeted)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Target size={35} />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Monthly allocation
          </div>
        </div>

        {/* Actual Spending */}
        <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Actual Spending
              </h3>
              <p className="text-2xl font-bold  mt-1">
                {formatCurrency(totalActual)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Receipt size={35} />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">This month</div>
        </div>

        {/* Variance */}
        <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Variance
              </h3>
              <p
                className={`text-2xl font-bold mt-1 ${
                  totalVariance >= 0 ? "text-success" : "text-error"
                }`}
              >
                {totalVariance >= 0 ? "+" : ""}
                {formatCurrency(totalVariance)}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                totalVariance >= 0 ? "bg-green-800" : "bg-red-800"
              }`}
            >
              <TrendingUpDown size={35} />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalVariancePercent?.toFixed(1)}%{" "}
            {totalVariance >= 0 ? "under" : "over"} budget
          </div>
        </div>

        {/* Budget Usage */}
        <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Budget Usage
              </h3>
              <p className="text-2xl font-bold text-warning mt-1">
                {((totalActual / totalBudgeted) * 100)?.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <ChartPie size={35} />
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{
                width: `${Math.min((totalActual / totalBudgeted) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Budget vs Actual Chart */}
      <div className="bg-primary-foreground rounded-lg border">
        <div className="p-6 pb-1 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Budget VS Actual
              </h3>
              <p className="text-sm text-muted-foreground">
                Compare budgeted amounts with actual spending
              </p>
            </div>
            <Button
              onClick={() => setShowAddBudget(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 spa-transition flex items-center space-x-2"
            >
              <Plus name="Plus" size={16} />
              <span>Add Budget</span>
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="h-100" aria-label="Budget vs Actual Chart">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer
                config={chartConfig}
                className="mx-auto w-full max-h-full"
              >
                <BarChart data={budgetData} accessibilityLayer>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="category"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="budgeted"
                    fill="#fe7709"
                    name="Budgeted"
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                  <Bar
                    dataKey="actual"
                    fill="#09eafe"
                    name="Actual"
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">
            Budget Categories
          </h3>
          <div className="flex items-center space-x-2 text-muted-foreground">
            {/* <Icon name="Filter" size={16} /> */}
            <span className="text-sm">All Categories</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgetData?.map((category, index) => {
            const IconComponent = getStatusIcon(category?.status);
            return (
              <div
                key={index}
                className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft cursor-pointer hover:spa-shadow-elevated spa-transition"
                //   onClick={() => setSelectedCategory(selectedCategory === index ? null : index)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="p-3 bg-primary/10 rounded-lg"
                      style={{
                        backgroundColor: `${
                          categoryColors[category?.category]
                        }20`,
                      }}
                    >
                      {category.icon}
                     
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground">
                        {category?.category}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {}
                        <IconComponent
                          className={getStatusColor(category?.status)}
                        />
                       
                        <span
                          className={`text-sm ${getStatusColor(
                            category?.status
                          )}`}
                        >
                          {getStatusLabel(category?.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-card-foreground">
                      {formatCurrency(category?.actual)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of {formatCurrency(category?.budgeted)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Usage</span>
                    <span className="text-sm font-medium">
                      {((category?.actual / category?.budgeted) * 100)?.toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full spa-transition"
                      style={{
                        width: `${Math.min(
                          (category?.actual / category?.budgeted) * 100,
                          100
                        )}%`,
                        backgroundColor:
                          category?.status === "over"
                            ? "#ff0000"
                            : category?.status === "under"
                            ? "#00cf1c"
                            : "#0f7fff",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Variance Info */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Variance
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-medium ${
                        category?.variance >= 0 ? "text-success" : "text-error"
                      }`}
                    >
                      {category?.variance >= 0 ? "+" : ""}
                      {formatCurrency(category?.variance)}
                    </span>
                    <span
                      className={`text-xs ${
                        category?.variance >= 0 ? "text-success" : "text-error"
                      }`}
                    >
                      ({category?.variancePercent?.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Expandable Details */}
                {selectedCategory === index && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Remaining
                        </div>
                        <div className="font-semibold text-foreground">
                          {formatCurrency(
                            Math.max(0, category?.budgeted - category?.actual)
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Days Left
                        </div>
                        <div className="font-semibold text-foreground">
                          12 days
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 spa-transition text-sm font-medium">
                        Adjust Budget
                      </button>
                      <button className="flex-1 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 spa-transition text-sm font-medium">
                        View History
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Alerts */}
      <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Budget Alerts
            </h3>
            <p className="text-sm text-muted-foreground">
              Categories requiring attention
            </p>
          </div>
          {/* <Icon name="AlertTriangle" size={20} className="text-warning" /> */}
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-error/10 rounded-lg border border-error/20">
            {/* <Icon name="AlertCircle" size={20} className="text-error mt-0.5" /> */}
            <div>
              <h4 className="font-medium text-error">Marketing Over Budget</h4>
              <p className="text-sm text-muted-foreground">
                Marketing expenses are 20% over budget. Consider reviewing
                campaign costs.
              </p>
              <button className="text-xs text-error hover:underline mt-1">
                View Details
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
            {/* <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" /> */}
            <div>
              <h4 className="font-medium text-warning">
                Staff Salaries Approaching Limit
              </h4>
              <p className="text-sm text-muted-foreground">
                Staff salary expenses are at 94% of monthly budget with 12 days
                remaining.
              </p>
              <button className="text-xs text-warning hover:underline mt-1">
                Adjust Budget
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-success/10 rounded-lg border border-success/20">
            {/* <Icon name="CheckCircle" size={20} className="text-success mt-0.5" /> */}
            <div>
              <h4 className="font-medium text-success">
                Supplies Under Budget
              </h4>
              <p className="text-sm text-muted-foreground">
                Supply expenses are 10% under budget. Good cost management this
                month!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
