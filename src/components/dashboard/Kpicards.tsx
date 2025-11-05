"use client"


import SingleKpiCard from "./SingleKpiCard"

 
 
 
 const kpis = [
    {
      title: "Total Revenue",
      value: "$24,580",
      change: "12.5% from last month",
      isPositive: true,
      icon: "📈",
    },
    {
      title: "Total Bookings",
      value: "384",
      change: "8.2% increase",
      isPositive: true,
      icon: "🛒",
    },
    {
      title: "New Clients",
      value: "42",
      change: "5.1% increase",
      isPositive: true,
      icon: "👥",
    },
    {
      title: "Avg Session Value",
      value: "$64",
      change: "2.3% increase",
      isPositive: true,
      icon: "🏆",
    },
    {
      title: "Occupancy Rate",
      value: "87%",
      change: "4.5% increase",
      isPositive: true,
      icon: "⚡",
    },
  ]

const Kpicards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <SingleKpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  )
}

export default Kpicards