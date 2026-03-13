"use client";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartArea, ChartBar, ChartSpline, Icon } from "lucide-react";
import React, { useState } from "react";

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



const OverViewFinManag = ({ timeRange }: any) => {
  const [chartType, setChartType] = useState("area");
  const [dataView, setDataView] = useState("all");

  const dataViewOptions = [
    { id: "all", label: "All Data" },
    { id: "incomes", label: "Income Only" },
    { id: "expenses", label: "Expenses Only" },
    { id: "savings", label: "Savings Only" },
  ];

  const chartTypeOptions = [
    { id: "area", label: "Area", icon: <ChartArea/> },
    { id: "bar", label: "Bar", icon: <ChartBar className="rotate-90 scale-x-[-1]" /> },
    { id: "line", label: "Line", icon: <ChartSpline/> },
    // { id: "pie", label: "Pie", icon: "PieChart" },
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

  const axisColor = {
    xAxis: "#54545483",
    yAxis: "#54545483",
    grid: "#54545483",
  };

  const renderChart = () => {
    // if (chartType === "pie") {
    //   const [chartTimeRange, setChartTimeRange] = useState("90d");

    //   const chartData = [
    //     { date: "2024-04-01", desktop: 222, mobile: 150 },
    //     { date: "2024-04-02", desktop: 97, mobile: 180 },
    //     { date: "2024-04-03", desktop: 167, mobile: 120 },
    //     { date: "2024-04-04", desktop: 242, mobile: 260 },
    //     { date: "2024-04-05", desktop: 373, mobile: 290 },
    //     { date: "2024-04-06", desktop: 301, mobile: 340 },
    //     { date: "2024-04-07", desktop: 245, mobile: 180 },
    //     { date: "2024-04-08", desktop: 409, mobile: 320 },
    //     { date: "2024-04-09", desktop: 59, mobile: 110 },
    //     { date: "2024-04-10", desktop: 261, mobile: 190 },
    //     { date: "2024-04-11", desktop: 327, mobile: 350 },
    //     { date: "2024-04-12", desktop: 292, mobile: 210 },
    //     { date: "2024-04-13", desktop: 342, mobile: 380 },
    //     { date: "2024-04-14", desktop: 137, mobile: 220 },
    //     { date: "2024-04-15", desktop: 120, mobile: 170 },
    //     { date: "2024-04-16", desktop: 138, mobile: 190 },
    //     { date: "2024-04-17", desktop: 446, mobile: 360 },
    //     { date: "2024-04-18", desktop: 364, mobile: 410 },
    //     { date: "2024-04-19", desktop: 243, mobile: 180 },
    //     { date: "2024-04-20", desktop: 89, mobile: 150 },
    //     { date: "2024-04-21", desktop: 137, mobile: 200 },
    //     { date: "2024-04-22", desktop: 224, mobile: 170 },
    //     { date: "2024-04-23", desktop: 138, mobile: 230 },
    //     { date: "2024-04-24", desktop: 387, mobile: 290 },
    //     { date: "2024-04-25", desktop: 215, mobile: 250 },
    //     { date: "2024-04-26", desktop: 75, mobile: 130 },
    //     { date: "2024-04-27", desktop: 383, mobile: 420 },
    //     { date: "2024-04-28", desktop: 122, mobile: 180 },
    //     { date: "2024-04-29", desktop: 315, mobile: 240 },
    //     { date: "2024-04-30", desktop: 454, mobile: 380 },
    //     { date: "2024-05-01", desktop: 165, mobile: 220 },
    //     { date: "2024-05-02", desktop: 293, mobile: 310 },
    //     { date: "2024-05-03", desktop: 247, mobile: 190 },
    //     { date: "2024-05-04", desktop: 385, mobile: 420 },
    //     { date: "2024-05-05", desktop: 481, mobile: 390 },
    //     { date: "2024-05-06", desktop: 498, mobile: 520 },
    //     { date: "2024-05-07", desktop: 388, mobile: 300 },
    //     { date: "2024-05-08", desktop: 149, mobile: 210 },
    //     { date: "2024-05-09", desktop: 227, mobile: 180 },
    //     { date: "2024-05-10", desktop: 293, mobile: 330 },
    //     { date: "2024-05-11", desktop: 335, mobile: 270 },
    //     { date: "2024-05-12", desktop: 197, mobile: 240 },
    //     { date: "2024-05-13", desktop: 197, mobile: 160 },
    //     { date: "2024-05-14", desktop: 448, mobile: 490 },
    //     { date: "2024-05-15", desktop: 473, mobile: 380 },
    //     { date: "2024-05-16", desktop: 338, mobile: 400 },
    //     { date: "2024-05-17", desktop: 499, mobile: 420 },
    //     { date: "2024-05-18", desktop: 315, mobile: 350 },
    //     { date: "2024-05-19", desktop: 235, mobile: 180 },
    //     { date: "2024-05-20", desktop: 177, mobile: 230 },
    //     { date: "2024-05-21", desktop: 82, mobile: 140 },
    //     { date: "2024-05-22", desktop: 81, mobile: 120 },
    //     { date: "2024-05-23", desktop: 252, mobile: 290 },
    //     { date: "2024-05-24", desktop: 294, mobile: 220 },
    //     { date: "2024-05-25", desktop: 201, mobile: 250 },
    //     { date: "2024-05-26", desktop: 213, mobile: 170 },
    //     { date: "2024-05-27", desktop: 420, mobile: 460 },
    //     { date: "2024-05-28", desktop: 233, mobile: 190 },
    //     { date: "2024-05-29", desktop: 78, mobile: 130 },
    //     { date: "2024-05-30", desktop: 340, mobile: 280 },
    //     { date: "2024-05-31", desktop: 178, mobile: 230 },
    //     { date: "2024-06-01", desktop: 178, mobile: 200 },
    //     { date: "2024-06-02", desktop: 470, mobile: 410 },
    //     { date: "2024-06-03", desktop: 103, mobile: 160 },
    //     { date: "2024-06-04", desktop: 439, mobile: 380 },
    //     { date: "2024-06-05", desktop: 88, mobile: 140 },
    //     { date: "2024-06-06", desktop: 294, mobile: 250 },
    //     { date: "2024-06-07", desktop: 323, mobile: 370 },
    //     { date: "2024-06-08", desktop: 385, mobile: 320 },
    //     { date: "2024-06-09", desktop: 438, mobile: 480 },
    //     { date: "2024-06-10", desktop: 155, mobile: 200 },
    //     { date: "2024-06-11", desktop: 92, mobile: 150 },
    //     { date: "2024-06-12", desktop: 492, mobile: 420 },
    //     { date: "2024-06-13", desktop: 81, mobile: 130 },
    //     { date: "2024-06-14", desktop: 426, mobile: 380 },
    //     { date: "2024-06-15", desktop: 307, mobile: 350 },
    //     { date: "2024-06-16", desktop: 371, mobile: 310 },
    //     { date: "2024-06-17", desktop: 475, mobile: 520 },
    //     { date: "2024-06-18", desktop: 107, mobile: 170 },
    //     { date: "2024-06-19", desktop: 341, mobile: 290 },
    //     { date: "2024-06-20", desktop: 408, mobile: 450 },
    //     { date: "2024-06-21", desktop: 169, mobile: 210 },
    //     { date: "2024-06-22", desktop: 317, mobile: 270 },
    //     { date: "2024-06-23", desktop: 480, mobile: 530 },
    //     { date: "2024-06-24", desktop: 132, mobile: 180 },
    //     { date: "2024-06-25", desktop: 141, mobile: 190 },
    //     { date: "2024-06-26", desktop: 434, mobile: 380 },
    //     { date: "2024-06-27", desktop: 448, mobile: 490 },
    //     { date: "2024-06-28", desktop: 149, mobile: 200 },
    //     { date: "2024-06-29", desktop: 103, mobile: 160 },
    //     { date: "2024-06-30", desktop: 446, mobile: 400 },
    //   ];

    //   const chartConfig = {
    //     visitors: {
    //       label: "Visitors",
    //     },
    //     desktop: {
    //       label: "Desktop",
    //       color: "var(--chart-1)",
    //     },
    //     mobile: {
    //       label: "Mobile",
    //       color: "var(--chart-2)",
    //     },
    //   } satisfies ChartConfig;

    //   const filteredData = chartData.filter((item) => {
    //     const date = new Date(item.date);
    //     const referenceDate = new Date("2024-06-30");
    //     let daysToSubtract = 90;
    //     if (chartTimeRange === "30d") {
    //       daysToSubtract = 30;
    //     } else if (chartTimeRange === "7d") {
    //       daysToSubtract = 7;
    //     }
    //     const startDate = new Date(referenceDate);
    //     startDate.setDate(startDate.getDate() - daysToSubtract);
    //     return date >= startDate;
    //   });
    //   return (
    //     <>
    //       <Select value={chartTimeRange} onValueChange={setChartTimeRange}>
    //         <SelectTrigger
    //           className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
    //           aria-label="Select a value"
    //         >
    //           <SelectValue placeholder="Last 3 months" />
    //         </SelectTrigger>
    //         <SelectContent className="rounded-xl">
    //           <SelectItem value="90d" className="rounded-lg">
    //             Last 3 months
    //           </SelectItem>
    //           <SelectItem value="30d" className="rounded-lg">
    //             Last 30 days
    //           </SelectItem>
    //           <SelectItem value="7d" className="rounded-lg">
    //             Last 7 days
    //           </SelectItem>
    //         </SelectContent>
    //       </Select>
    //       <ChartContainer
    //         config={chartConfig}
    //         className="aspect-auto h-[250px] w-full"
    //       >
    //         <AreaChart data={filteredData}>
    //           <defs>
    //             <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
    //               <stop
    //                 offset="5%"
    //                 stopColor="var(--color-desktop)"
    //                 stopOpacity={0.8}
    //               />
    //               <stop
    //                 offset="95%"
    //                 stopColor="var(--color-desktop)"
    //                 stopOpacity={0.1}
    //               />
    //             </linearGradient>
    //             <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
    //               <stop
    //                 offset="5%"
    //                 stopColor="var(--color-mobile)"
    //                 stopOpacity={0.8}
    //               />
    //               <stop
    //                 offset="95%"
    //                 stopColor="var(--color-mobile)"
    //                 stopOpacity={0.1}
    //               />
    //             </linearGradient>
    //           </defs>
    //           <CartesianGrid vertical={false} />
    //           <XAxis
    //             dataKey="date"
    //             tickLine={false}
    //             axisLine={false}
    //             tickMargin={8}
    //             minTickGap={32}
    //             tickFormatter={(value) => {
    //               const date = new Date(value);
    //               return date.toLocaleDateString("en-US", {
    //                 month: "short",
    //                 day: "numeric",
    //               });
    //             }}
    //           />
    //           <ChartTooltip
    //             cursor={false}
    //             content={
    //               <ChartTooltipContent
    //                 labelFormatter={(value) => {
    //                   return new Date(value).toLocaleDateString("en-US", {
    //                     month: "short",
    //                     day: "numeric",
    //                   });
    //                 }}
    //                 indicator="dot"
    //               />
    //             }
    //           />
    //           <Area
    //             dataKey="mobile"
    //             type="natural"
    //             fill="url(#fillMobile)"
    //             stroke="var(--color-mobile)"
    //             stackId="a"
    //           />
    //           <Area
    //             dataKey="desktop"
    //             type="natural"
    //             fill="url(#fillDesktop)"
    //             stroke="var(--color-desktop)"
    //             stackId="a"
    //           />
    //           <ChartLegend content={<ChartLegendContent />} />
    //         </AreaChart>
    //       </ChartContainer>
    //     </>
    //   );
    // }

    const filteredData = currentData?.map((item) => {
      if (dataView === "incomes") return { ...item, expenses: 0, savings: 0 };
      if (dataView === "expenses") return { ...item, income: 0, savings: 0 };
      if (dataView === "savings") return { ...item, income: 0, expenses: 0 };
      return item;
    });

    if (chartType === "area") {
      const chartConfig = {
        incomes: {
          label: "Incomes",
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
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-h-full"
        >
          <AreaChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke={axisColor.grid} />
            <XAxis dataKey="name" stroke={axisColor.xAxis} fontSize={12} />
            <YAxis stroke={axisColor.yAxis} fontSize={12} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <defs>
              <linearGradient id="fillIncomes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-incomes)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-incomes)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSavings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-savings)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-savings)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            {(dataView === "all" || dataView === "incomes") && (
              <Area
                dataKey="incomes"
                type="monotone"
                fill="url(#fillIncomes)"
                fillOpacity={0.6}
                stroke="var(--color-incomes)"
                stackId="1"
              />
            )}
            {(dataView === "all" || dataView === "expenses") && (
              <Area
                dataKey="expenses"
                type="monotone"
                fill="url(#fillExpenses)"
                fillOpacity={0.6}
                stroke="var(--color-expenses)"
                stackId="1"
              />
            )}
            {(dataView === "all" || dataView === "savings") && (
              <Area
                dataKey="savings"
                type="monotone"
                fill="url(#fillSavings)"
                fillOpacity={0.6}
                stroke="var(--color-savings)"
                stackId="1"
              />
            )}
          </AreaChart>
        </ChartContainer>
      );
    }

    if (chartType === "line") {
       const chartConfig = {
      incomes: {
        label: "Incomes",
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
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-h-full"
        >
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke={axisColor.grid} />
            <XAxis dataKey="name" stroke={axisColor.xAxis} fontSize={12} />
            <YAxis stroke={axisColor.yAxis} fontSize={12} />
            {/* <Tooltip content={<CustomTooltip />} /> */}
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {(dataView === "all" || dataView === "incomes") && (
              <Line
                type="monotone"
                dataKey="incomes"
                stroke="var(--color-incomes)"
                strokeWidth={3}
                dot={{ fill: "var(--color-success)", strokeWidth: 2, r: 4 }}
              />
            )}
            {(dataView === "all" || dataView === "expenses") && (
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="var(--color-expenses)"
                strokeWidth={3}
                dot={{ fill: "var(--color-error)", strokeWidth: 2, r: 4 }}
              />
            )}
            {(dataView === "all" || dataView === "savings") && (
              <Line
                type="monotone"
                dataKey="savings"
                stroke="var(--color-savings)"
                strokeWidth={3}
                dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 4 }}
              />
            )}
          </LineChart>
        </ChartContainer>
      );
    }

    
    const chartConfig = {
      incomes: {
        label: "Incomes",
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
      <ChartContainer
        config={chartConfig}
        className="mx-auto w-full max-h-full"
      >
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke={axisColor.grid} />
          <XAxis dataKey="name" stroke={axisColor.xAxis} fontSize={12} />
          <YAxis stroke={axisColor.yAxis} fontSize={12} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          {(dataView === "all" || dataView === "incomes") && (
            <Bar dataKey="incomes" fill="var(--color-incomes)" radius={[4, 4, 0, 0]} />
          )}
          {(dataView === "all" || dataView === "expenses") && (
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
          )}
          {(dataView === "all" || dataView === "savings") && (
            <Bar dataKey="savings" fill="var(--color-savings)" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ChartContainer>
    );
  };

  return (
    <div className="bg-primary-foreground rounded-lg border">
      <div className="p-6 ">
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
            <Select onValueChange={(e) => setDataView(e)} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue/>
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

            <div className="flex items-center rounded-lg">
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
