"use client";

import { LabelList, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../../components/ui/chart";

const revenueData = [
  { date: "Mon", revenue: 4000, percent: 57 },
  { date: "Tue", revenue: 3000, percent: 43 },
  { date: "Wed", revenue: 2000, percent: 29 },
  { date: "Thu", revenue: 2780, percent: 40 },
  { date: "Fri", revenue: 1890, percent: 27 },
  { date: "Sat", revenue: 2390, percent: 34 },
  { date: "Sun", revenue: 3490, percent: 50 },
];

const bookingsByService = [
  { service: "Massage", bookings: 65, percent: 34 },
  { service: "Facial", bookings: 45, percent: 23 },
  { service: "Spa", bookings: 38, percent: 20 },
  { service: "Therapy", bookings: 52, percent: 27 },
];

// const revenueShare = [
//   { name: "Massage", value: 45 },
//   { name: "Facial", value: 25 },
//   { name: "Spa", value: 20 },
//   { name: "Therapy", value: 10 },
// ];
const revenueShare = [
  { name: "massage", value: 45, fill: "#0080ff" },
  { name: "facial", value: 25, fill: "#6fa300" },
  { name: "spa", value: 20, fill: "#8e0000" },
  { name: "therapy", value: 10, fill: "#1100c8" },
]
const chartConfig = {
  massage: {
    label: "Massage",
  },
  facial: {
    label: "Facial",
    color: "#c3d4e4",
  },
  spa: {
    label: "Spa",
    color: "var(--chart-2)",
  },
  therapy: {
    label: "Therapy",
    color: "var(--chart-3)",
  },
 
} satisfies ChartConfig

const ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart - Revenue Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Weekly revenue trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData.map((item) => (
              <div key={item.date} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">
                    {item.date}
                  </span>
                  <span className="text-muted-foreground">${item.revenue}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Bookings by Service */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings by Service</CardTitle>
          <CardDescription>Service demand this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookingsByService.map((item) => (
              <div key={item.service} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">
                    {item.service}
                  </span>
                  <span className="text-muted-foreground">{item.bookings}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Donut Chart - Revenue Share */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Share by Service</CardTitle>
          <CardDescription>Distribution of income</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[350px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="value" hideLabel />}
              />
              <Pie data={revenueShare} dataKey="value">
                <LabelList
                  dataKey="name"
                  className="fill-background"
                  stroke="1"
                  fontSize={12}
                  
                  formatter={(value: keyof typeof chartConfig) =>
                    chartConfig[value]?.label
                  }
                />
              </Pie>
               <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
            </PieChart>
          </ChartContainer>

          {/* <div className="space-y-4">
            {revenueShare.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        item.name === "Massage"
                          ? "hsl(var(--chart-1))"
                          : item.name === "Facial"
                          ? "hsl(var(--chart-2))"
                          : item.name === "Spa"
                          ? "hsl(var(--chart-3))"
                          : "hsl(var(--chart-4))",
                    }}
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {item.value}%
                </span>
              </div>
            ))}
          </div> */}
        </CardContent>
      </Card>

      {/* Peak Hours Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Booking Hours</CardTitle>
          <CardDescription>Busiest times during the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => {
              const intensity = Math.random();
              return (
                <div
                  key={i}
                  className="h-10 rounded-md transition-all hover:ring-2 ring-primary cursor-pointer"
                  style={{
                    backgroundColor: `hsl(var(--chart-1) / ${intensity})`,
                  }}
                  title={`Intensity: ${Math.round(intensity * 100)}%`}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Lighter to darker shows low to high booking intensity
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;
