"use client";

import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Tooltip } from "../../../components/ui/tooltip";
import {
  ChartBar,
  ChartPie,
  House,
  Inbox,
  Info,
  Lightbulb,
  Megaphone,
  MoreHorizontal,
  MoreVertical,
  Package,
  Settings,
  Users,
} from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import { Progress } from "../../../components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
const CustomLegend = () => {
  return <></>;
};
const ExpenseBreakdown = ({ timeRange }: any) => {
  const [viewType, setViewType] = useState("pie");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const expenseData = [
    {
      category: "Staff Salaries",
      amount: 8500,
      percentage: 46.4,
      color: "#f83e00",
      icon: <Users />,
      trend: "+5.2%",
      trendType: "negative",
      items: [
        { name: "Lead Therapist", amount: 3500 },
        { name: "Massage Therapists (2)", amount: 4200 },
        { name: "Receptionist", amount: 800 },
      ],
    },
    {
      category: "Utilities",
      amount: 2300,
      percentage: 12.6,
      color: "var(--color-warning)",
      icon: <Lightbulb />,
      trend: "+2.1%",
      trendType: "negative",
      items: [
        { name: "Electricity", amount: 1200 },
        { name: "Water", amount: 400 },
        { name: "Internet & Phone", amount: 700 },
      ],
    },
    {
      category: "Supplies",
      amount: 1800,
      percentage: 9.8,
      color: "var(--color-success)",
      icon: <Package />,
      trend: "-3.4%",
      trendType: "positive",
      items: [
        { name: "Essential Oils", amount: 650 },
        { name: "Towels & Linens", amount: 450 },
        { name: "Cleaning Products", amount: 700 },
      ],
    },
    {
      category: "Marketing",
      amount: 1200,
      percentage: 6.5,
      color: "var(--color-error)",
      icon: <Megaphone />,
      trend: "+12.8%",
      trendType: "negative",
      items: [
        { name: "Social Media Ads", amount: 600 },
        { name: "Print Materials", amount: 300 },
        { name: "Website Maintenance", amount: 300 },
      ],
    },
    {
      category: "Rent",
      amount: 2800,
      percentage: 15.3,
      color: "var(--color-accent)",
      icon: <House />,
      trend: "0%",
      trendType: "neutral",
      items: [
        { name: "Monthly Rent", amount: 2500 },
        { name: "Property Insurance", amount: 300 },
      ],
    },
    {
      category: "Equipment",
      amount: 900,
      percentage: 4.9,
      color: "var(--color-secondary)",
      icon: <Settings />,
      trend: "-8.2%",
      trendType: "positive",
      items: [
        { name: "Maintenance", amount: 400 },
        { name: "New Equipment", amount: 500 },
      ],
    },
    {
      category: "Other",
      amount: 820,
      percentage: 4.5,
      color: "var(--color-muted)",
      icon: <Inbox />,
      trend: "+1.5%",
      trendType: "negative",
      items: [
        { name: "Licenses & Permits", amount: 320 },
        { name: "Professional Services", amount: 500 },
      ],
    },
  ];

  const totalExpenses = expenseData?.reduce(
    (sum, item) => sum + item?.amount,
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    })?.format(amount);
  };

  const getTrendColor = (trendType: any) => {
    if (trendType === "positive") return "text-success";
    if (trendType === "negative") return "text-error";
    return "text-muted-foreground";
  };

  const getTrendIcon = (trendType: any) => {
    if (trendType === "positive") return "TrendingDown";
    if (trendType === "negative") return "TrendingUp";
    return "Minus";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 spa-shadow-elevated">
          <p className="font-medium text-popover-foreground mb-2">
            {data?.category}
          </p>
          <div className="space-y-1">
            <p className="text-sm">Amount: {formatCurrency(data?.amount)}</p>
            <p className="text-sm">Percentage: {data?.percentage}%</p>
            <div className="flex items-center space-x-1 mt-2">
              {/* <Icon name={getTrendIcon(data?.trendType)} size={14} className={getTrendColor(data?.trendType)} /> */}
              <span className={`text-sm ${getTrendColor(data?.trendType)}`}>
                {data?.trend} vs last month
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartTypeOptions = [
    {
      id: "bar",
      label: "Bar",
      icon: <ChartBar className="rotate-90 scale-x-[-1]" />,
    },
    { id: "pie", label: "Pie", icon: <ChartPie /> },
    // { id: "pie", label: "Pie", icon: "PieChart" },
  ];
  // Define colors for your expense categories
  const categoryColors = {
    "Staff Salaries": "#dc2626", // Strong Red
    Rent: "#ea580c", // Orange
    Utilities: "#ca8a04", // Amber/Gold
    Supplies: "#16a34a", // Green
    Marketing: "#2563eb", // Blue
    Equipment: "#7c3aed", // Purple
    Other: "#64748b", // Slate Gray
  };
  return (
    <div className="space-y-8 ">
      {/* Expense Breakdown */}
      <div className="bg-primary-foreground rounded-lg border">
        <div className="p-6 border-b border-border">
          {/* Header */}
          <div className="flex items-center justify-between ">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Expense Breakdown
              </h3>
              <p className="text-sm text-muted-foreground">
                Detailed analysis of business expenses
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {chartTypeOptions?.map((option, index) => (
                <button
                  key={option?.id}
                  onClick={() => setViewType(option?.id)}
                  className={`p-2 spa-transition ${
                    index === 0
                      ? "rounded-l-lg"
                      : index === chartTypeOptions?.length - 1
                      ? "rounded-r-lg"
                      : ""
                  } ${
                    viewType === option?.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  title={option?.label}
                >
                  {option?.icon}
                  {/* <Icon name={option?.icon} size={16} /> */}
                </button>
              ))}

              {/* <Icon name="BarChart3" size={16} /> */}
            </div>
          </div>

          <div className="text-center mb-2">
            <div className="text-3xl font-bold text-error mb-2 text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Monthly Expenses
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="h-90" aria-label="Expense Breakdown Chart">
            <ResponsiveContainer width="100%" height="100%">
              {viewType === "pie"
                ? (() => {
                    // Add fill property to your expenseData
                    const enrichedExpenseData = expenseData.map((item) => ({
                      ...item,
                      fill: categoryColors[item.category] || "#6b7280",
                    }));

                    const chartConfig = expenseData.reduce((acc, item) => {
                      acc[item.category] = {
                        label: item.category,
                        color: categoryColors[item.category] || "#6b7280",
                      };
                      return acc;
                    }, {} as ChartConfig);

                    const totalAmount = expenseData.reduce(
                      (sum, item) => sum + item.amount,
                      0
                    );

                    return (
                      <div className=" items-center gap-8 w-full">
                        <ChartContainer
                          config={chartConfig}
                          // className="[&_.recharts-pie-label-text]:fill-foreground mx-auto pb-0"
                          className="mx-auto   max-h-[300px] shrink-0 flex flex-col  w-3/4 "
                        >
                          <PieChart>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent />}
                            />
                            <Pie
                              data={enrichedExpenseData}
                              nameKey="category"
                              innerRadius={90}
                              outerRadius={120}
                              strokeWidth={5}
                              cx="50%"
                              cy="50%"
                              paddingAngle={4}
                              dataKey="amount"
                              label
                            >
                              <Label
                                content={({ viewBox }) => {
                                  if (
                                    viewBox &&
                                    "cx" in viewBox &&
                                    "cy" in viewBox
                                  ) {
                                    return (
                                      <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                      >
                                        <tspan
                                          x={viewBox.cx}
                                          y={viewBox.cy}
                                          className="fill-foreground text-3xl font-bold"
                                        >
                                          {totalAmount.toLocaleString()} $
                                        </tspan>
                                        <tspan
                                          x={viewBox.cx}
                                          y={(viewBox.cy || 0) + 24}
                                          className="fill-muted-foreground"
                                        >
                                          Total Monthly Expenses
                                        </tspan>
                                      </text>
                                    );
                                  }
                                }}
                              />
                            </Pie>
                            <ChartLegend
                              layout="vertical"
                              verticalAlign="middle"
                              align="left"
                              content={
                                <ChartLegendContent nameKey="category" />
                              }
                              className="flex-wrap gap-5 *:basis-1/4 *:justify-center text-lg"
                            />
                          </PieChart>
                        </ChartContainer>
                      </div>
                    );
                  })()
                : (() => {
                    // Perform your task here before rendering
                    const chartConfig = {
                      "Staff Salaries": {
                        label: "Staff Salaries",
                        color: "#fd0000",
                      },
                    } satisfies ChartConfig;

                    // const chartConfig = expenseData.reduce((acc, item) => {
                    //   acc[item.category] = {
                    //     label: item.category,
                    //     color: item.color
                    //       .replace("var(--color-", "hsl(var(--")
                    //       .replace(")", "))"),
                    //   };
                    //   return acc;
                    // }, {} as ChartConfig);
                    return (
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto w-full max-h-full"
                      >
                        <BarChart
                          data={expenseData}
                          layout="horizontal"
                          accessibilityLayer
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                          />
                          <XAxis
                            type="category"
                            dataKey="category"
                            stroke="var(--color-muted-foreground)"
                            fontSize={12}
                          />
                          <YAxis
                            type="number"
                            dataKey="amount"
                            stroke="var(--color-muted-foreground)"
                            fontSize={12}
                            width={100}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar
                            dataKey="amount"
                            fill="#ff1212"
                            radius={[8, 8, 0, 0]}
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
                    );
                  })()}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        {expenseData?.map((category, index) => (
          <div
            key={index}
            className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft cursor-pointer hover:spa-shadow-elevated spa-transition"
            // onClick={() => setSelectedCategory(selectedCategory === index ? null : index)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: `${categoryColors[category?.category]}20`,
                  }}
                >
                  {category?.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground">
                    {category?.category}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {category?.percentage}% of total
                  </p>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Info
                      size={20}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === index ? null : index
                        )
                      }
                    />
                    {/* <Button variant="outline">Open popover</Button> */}
                  </PopoverTrigger>
                  <PopoverContent className="w-90" side="right" sideOffset={10}>
                    <div className="grid gap-4">
                      {/* Expandable Details */}
                      {selectedCategory === index && (
                        <div className="">
                          <h5 className="font-medium text-card-foreground mb-3">
                            Expense Breakdown
                          </h5>
                          <div className="space-y-2">
                            {category?.items?.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm text-muted-foreground">
                                  {item?.name}
                                </span>
                                <span className="text-sm font-medium text-card-foreground">
                                  {formatCurrency(item?.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right">
                <div className="font-semibold text-card-foreground">
                  {formatCurrency(category?.amount)}
                </div>
                <div className="flex items-center space-x-1 justify-end">
                  <span
                    className={`text-sm ${getTrendColor(category?.trendType)}`}
                  >
                    {category?.trend}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}

            <div className="mt-8 w-full flex items-center">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full "
                  style={{
                    width: `${category?.percentage}%`,
                    backgroundColor: categoryColors[category?.category],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expense Trends */}
      <div className="bg-primary-foreground rounded-lg border p-6 spa-shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Expense Trends
            </h3>
            <p className="text-sm text-muted-foreground">
              Month-over-month comparison
            </p>
          </div>
          {/* <Icon name="TrendingUp" size={20} className="text-muted-foreground" /> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-error/10 rounded-lg">
            <div className="text-3xl font-bold text-error mb-1 text-green-600">
              +8.7%
            </div>
            <div className="text-sm text-muted-foreground">
              Overall Increase
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs last month</p>
          </div>
          <div className="text-center p-4 bg-warning/10 rounded-lg">
            <div className="text-3xl font-bold text-warning mb-1">3</div>
            <div className="text-sm text-muted-foreground">
              Categories Increased
            </div>
            <p className="text-xs text-muted-foreground mt-2">above budget</p>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <div className="text-3xl font-bold text-success mb-1">2</div>
            <div className="text-sm text-muted-foreground">
              Categories Decreased
            </div>
            <p className="text-xs text-muted-foreground mt-2">under budget</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseBreakdown;
