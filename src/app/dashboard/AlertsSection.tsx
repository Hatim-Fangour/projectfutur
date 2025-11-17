"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

 const alerts = [
    {
      type: "warning",
      icon: "⚠️",
      title: "Low Stock Alert",
      description: "Products running low on inventory",
      items: ["Massage Stones (8 units)", "Lavender Oil (6 units)"],
      severity: "warning",
    },
    {
      type: "info",
      icon: "⏰",
      title: "Upcoming Appointments",
      description: "Next scheduled appointments today",
      items: ["Sarah Johnson - 2:00 PM", "Michael Chen - 3:30 PM", "Emily Rodriguez - 4:45 PM"],
      severity: "info",
    },
    {
      type: "alert",
      icon: "💵",
      title: "Pending Payments",
      description: "Invoices awaiting payment",
      items: ["Invoice #1234 - $320", "Invoice #1235 - $480"],
      severity: "destructive",
    },
  ]

  const bookingStats = [
    { label: "Today's Bookings", value: "12", icon: "📅", trend: "+5 from yesterday" },
    { label: "This Week's Revenue", value: "$8,450", icon: "📈", trend: "+12% increase" },
    { label: "Active Clients", value: "156", icon: "👥", trend: "+8 new this week" },
  ]



const AlertsSection = () => {
  return (
     <div className="space-y-6">
      {/* Booking Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bookingStats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className="text-xl">{stat.icon}</span>
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {alerts.map((alert, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-md text-2xl ${
                    alert.severity === "warning"
                      ? "bg-yellow-100"
                      : alert.severity === "info"
                        ? "bg-blue-100"
                        : "bg-red-100"
                  }`}
                >
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{alert.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{alert.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {alert.items.map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AlertsSection