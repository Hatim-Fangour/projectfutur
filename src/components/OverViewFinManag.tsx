"use client";

import { Icon } from "lucide-react";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Tooltip } from "./ui/tooltip";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

const OverViewFinManag = ({ timeRange }: any) => {
  const [chartType, setChartType] = useState("pie");
  const [dataView, setDataView] = useState("all");

  const dataViewOptions = [
    { id: "all", label: "All Data" },
    { id: "incomes", label: "Income Only" },
    { id: "expenses", label: "Expenses Only" },
    { id: "savings", label: "Savings Only" },
  ];

  const chartTypeOptions = [
    { id: "area", label: "Area", icon: "BarChart3" },
    { id: "bar", label: "Bar", icon: "BarChart" },
    { id: "line", label: "Line", icon: "TrendingUp" },
    { id: "pie", label: "Pie", icon: "PieChart" },
  ];

  const getChartData = () => {
    if (timeRange === "week") {
      return [
        { name: "Mon", income: 1800, expenses: 1200, savings: 600 },
        { name: "Tue", income: 2400, expenses: 1500, savings: 900 },
        { name: "Wed", income: 2200, expenses: 1800, savings: 400 },
        { name: "Thu", income: 2800, expenses: 1600, savings: 1200 },
        { name: "Fri", income: 3200, expenses: 2100, savings: 1100 },
        { name: "Sat", income: 3800, expenses: 2300, savings: 1500 },
        { name: "Sun", income: 2600, expenses: 1700, savings: 900 },
      ];
    } else if (timeRange === "month") {
      return [
        { name: "Week 1", incomes: 12000, expenses: 8500, savings: 3500 },
        { name: "Week 2", incomes: 15000, expenses: 10200, savings: 4800 },
        { name: "Week 3", incomes: 18000, expenses: 12300, savings: 5700 },
        { name: "Week 4", incomes: 16500, expenses: 11800, savings: 4700 },
      ];
    } else if (timeRange === "quarter") {
      return [
        { name: "Jan", incomes: 45000, expenses: 32000, savings: 13000 },
        { name: "Feb", incomes: 52000, expenses: 36000, savings: 16000 },
        { name: "Mar", incomes: 48000, expenses: 34000, savings: 14000 },
      ];
    } else {
      return [
        { name: "Q1", incomes: 145000, expenses: 102000, savings: 43000 },
        { name: "Q2", incomes: 165000, expenses: 115000, savings: 50000 },
        { name: "Q3", incomes: 158000, expenses: 108000, savings: 50000 },
        { name: "Q4", incomes: 172000, expenses: 120000, savings: 52000 },
      ];
    }
  };

  const currentData = getChartData();

  const pieData = [
    { name: "Incomes", value: 28450, fill: "#3affa3" },
    { name: "Expenses", value: 18320, fill: "#e63030" },
    { name: "Savings", value: 10130, fill: "#46f0fc" },
  ];

  const renderChart = () => {
    if (chartType === "pie") {
      const chartConfig = {
        incomes: {
          label: "Incomes",
        },
        expenses: {
          label: "Expenses",
          color: "#8a3e3e",
        },
        savings: {
          label: "Savings",
          color: "#2aa16a",
        },
      } satisfies ChartConfig;
      return (
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            ></Pie>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {/* <Tooltip 
            formatter={(value) => [`$${value?.toLocaleString()}`, '']}
            /> */}
          </PieChart>
        </ChartContainer>
      );
    }

    const filteredData = currentData?.map((item) => {
      if (dataView === "incomes") return { ...item, expenses: 0, savings: 0 };
      if (dataView === "expenses") return { ...item, income: 0, savings: 0 };
      if (dataView === "savings") return { ...item, income: 0, expenses: 0 };
      return item;
    });

    if (chartType === "area") {
      const chartConfig = {
        desktop: {
          label: "Desktop",
          color: "#098765",
        },
        mobile: {
          label: "Mobile",
          color: "#095467",
        },
      } satisfies ChartConfig;
      return (
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-h-full"
        >
          <AreaChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#098765" />
            <XAxis dataKey="name" stroke="#098765" fontSize={12} />
            <YAxis stroke="#098765" fontSize={12} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {(dataView === "all" || dataView === "incomes") && (
              <Area
                type="monotone"
                dataKey="incomes"
                stackId="1"
                stroke="#ff7684"
                fill="#ff7684"
                fillOpacity={0.6}
              />
            )}
            {(dataView === "all" || dataView === "expenses") && (
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="1"
                stroke="#9dff76"
                fill="#9dff76"
                fillOpacity={0.6}
              />
            )}
            {(dataView === "all" || dataView === "savings") && (
              <Area
                type="monotone"
                dataKey="savings"
                stackId="1"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        </ChartContainer>
      );
    }

    if (chartType === "line") {
      const chartConfig = {
        desktop: {
          label: "Desktop",
          color: "var(--chart-1)",
        },
        mobile: {
          label: "Mobile",
          color: "var(--chart-2)",
        },
      } satisfies ChartConfig;
      return (
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-h-full"
        >
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f9ee2a" />
            <XAxis dataKey="name" stroke="#f92a2a" fontSize={12} />
            <YAxis stroke="#f92a2a" fontSize={12} />
            {/* <Tooltip content={<CustomTooltip />} /> */}
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {(dataView === "all" || dataView === "incomes") && (
              <Line
                type="monotone"
                dataKey="incomes"
                stroke="#098765"
                strokeWidth={3}
                dot={{ fill: "var(--color-success)", strokeWidth: 2, r: 4 }}
              />
            )}
            {(dataView === "all" || dataView === "expenses") && (
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#858709"
                strokeWidth={3}
                dot={{ fill: "var(--color-error)", strokeWidth: 2, r: 4 }}
              />
            )}
            {(dataView === "all" || dataView === "savings") && (
              <Line
                type="monotone"
                dataKey="savings"
                // stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 4 }}
              />
            )}
          </LineChart>
        </ChartContainer>
      );
    }
    const chartConfig = {
      desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
      },
      mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
      },
    } satisfies ChartConfig;
    return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto w-full max-h-full"
      >
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#18c52f" />
          <XAxis dataKey="name" stroke="#f92a2a" fontSize={12} />
          <YAxis stroke="#0022ff" fontSize={12} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          {(dataView === "all" || dataView === "incomes") && (
            <Bar dataKey="incomes" fill="#3affa3" radius={[4, 4, 0, 0]} />
          )}
          {(dataView === "all" || dataView === "expenses") && (
            <Bar dataKey="expenses" fill="#e63030" radius={[4, 4, 0, 0]} />
          )}
          {(dataView === "all" || dataView === "savings") && (
            <Bar dataKey="savings" fill="#e60ee2" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ChartContainer>
    );
  };

  return (
    <div className="grid grid-cols-3 grid-rows- gap-4 w-full">
      <div className="grid col-span-3 row-span-  bg-primary-foreground p-4 rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Financial Overview
            </h3>
            <p className="text-sm text-muted-foreground">
              Income, expenses, and savings trends
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select onValueChange={(e) => setDataView(e)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {/* <SelectLabel>Fruits</SelectLabel> */}
                  {dataViewOptions?.map((option) => (
                    <SelectItem key={option?.id} value={option?.id}>
                      {option?.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex items-center border border-border rounded-lg">
              {chartTypeOptions?.map((option, index) => (
                <button
                  key={option?.id}
                  onClick={() => setChartType(option?.id)}
                  className={`p-2 spa-transition ${
                    index === 0
                      ? "rounded-l-lg"
                      : index === chartTypeOptions?.length - 1
                      ? "rounded-r-lg"
                      : ""
                  } ${
                    chartType === option?.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  title={option?.label}
                >
                  {option?.icon}
                  {/* <Icon name={option?.icon} size={16} /> */}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Chart */}
        <div className="w-full h-80 ">{renderChart()}</div>
      </div>
     
    </div>
  );
};

export default OverViewFinManag;
