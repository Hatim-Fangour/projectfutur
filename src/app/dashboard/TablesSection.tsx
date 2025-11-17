"use client";

import { Badge } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

function ProductsTable() {
  const products = [
    {
      id: 1,
      name: "Lavender Oil",
      unitsSold: 150,
      totalSales: "$4,500",
      margin: "35%",
      stock: 45,
    },
    {
      id: 2,
      name: "Massage Stones",
      unitsSold: 120,
      totalSales: "$3,600",
      margin: "42%",
      stock: 8,
    },
    {
      id: 3,
      name: "Essential Oils Kit",
      unitsSold: 95,
      totalSales: "$5,700",
      margin: "48%",
      stock: 22,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Performance</CardTitle>
        <CardDescription>Top selling products this month</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Units Sold</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Profit Margin</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.unitsSold}</TableCell>
                <TableCell>{product.totalSales}</TableCell>
                <TableCell>{product.margin}</TableCell>
                <TableCell>
                  {/* <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>{product.stock} units</Badge> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ServicesTable() {
  const services = [
    {
      id: 1,
      name: "Swedish Massage",
      sessions: 156,
      revenue: "$9,360",
      duration: "60 min",
      rating: "4.8",
    },
    {
      id: 2,
      name: "Deep Tissue",
      sessions: 128,
      revenue: "$8,960",
      duration: "90 min",
      rating: "4.7",
      badge: "Top Service",
    },
    {
      id: 3,
      name: "Facial Treatment",
      sessions: 94,
      revenue: "$5,640",
      duration: "45 min",
      rating: "4.6",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Ranking</CardTitle>
        <CardDescription>Performance metrics for all services</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.name}</span>
                    {/* {service.badge && <Badge variant="default">{service.badge}</Badge>} */}
                  </div>
                </TableCell>
                <TableCell>{service.sessions}</TableCell>
                <TableCell>{service.revenue}</TableCell>
                <TableCell>{service.duration}</TableCell>
                <TableCell>⭐ {service.rating}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


function CustomersTable() {
  const customers = [
    { id: 1, name: "Sarah Johnson", visits: 24, ltv: "$1,440", lastVisit: "2 days ago" },
    { id: 2, name: "Michael Chen", visits: 18, ltv: "$1,080", lastVisit: "1 week ago" },
    { id: 3, name: "Emily Rodriguez", visits: 15, ltv: "$900", lastVisit: "3 days ago" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
        <CardDescription>Highest value customers by lifetime visits</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Lifetime Value</TableHead>
              <TableHead>Last Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.visits}</TableCell>
                <TableCell>{customer.ltv}</TableCell>
                <TableCell className="text-muted-foreground">{customer.lastVisit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function StaffTable() {
  const staff = [
    { id: 1, name: "Lisa Thompson", sessions: 48, rating: "4.9", tips: "$680", revenue: "28%" },
    { id: 2, name: "James Wilson", sessions: 52, rating: "4.8", tips: "$720", revenue: "32%" },
    { id: 3, name: "Maria Garcia", sessions: 45, rating: "4.7", tips: "$600", revenue: "26%" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Performance</CardTitle>
        <CardDescription>Team productivity and ratings</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Tips</TableHead>
              <TableHead>Revenue %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                      {member.name[0]}
                    </div>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell>{member.sessions}</TableCell>
                <TableCell>⭐ {member.rating}</TableCell>
                <TableCell>{member.tips}</TableCell>
                <TableCell>{member.revenue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

const TablesSection = () => {
  return (
    <div className="space-y-6">
      {/* Products Performance Table */}
      <ProductsTable />

      {/* Services Table */}
      <ServicesTable />

      {/* Customers Table */}
      <CustomersTable />

      {/* Staff Performance Table */}
      <StaffTable />
    </div>
  );
};

export default TablesSection;
