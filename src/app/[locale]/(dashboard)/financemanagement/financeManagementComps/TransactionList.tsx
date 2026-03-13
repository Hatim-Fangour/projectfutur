"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TransactionList = ({ timeRange }: any) => {
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");

  const mockTransactions = [
    {
      id: 1,
      type: "income",
      category: "Service Payment",
      description: "Deep Tissue Massage - Client #4821",
      amount: 120,
      date: new Date("2025-11-01T14:30:00"),
      status: "completed",
      method: "Credit Card",
    },
    {
      id: 2,
      type: "expense",
      category: "Supplies",
      description: "Essential Oils & Aromatherapy Products",
      amount: 245,
      date: new Date("2025-11-01T10:15:00"),
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: 3,
      type: "income",
      category: "Package Deal",
      description: "Wellness Package - 6 Sessions",
      amount: 1200,
      date: new Date("2025-10-31T16:45:00"),
      status: "completed",
      method: "Cash",
    },
    {
      id: 4,
      type: "expense",
      category: "Utilities",
      description: "Electricity Bill - October",
      amount: 189,
      date: new Date("2025-10-31T09:00:00"),
      status: "completed",
      method: "Auto Pay",
    },
    {
      id: 5,
      type: "income",
      category: "Membership",
      description: "Monthly Membership Fee - Premium",
      amount: 89,
      date: new Date("2025-10-30T12:20:00"),
      status: "pending",
      method: "Direct Debit",
    },
    {
      id: 6,
      type: "expense",
      category: "Staff",
      description: "Salary Payment - Sarah Johnson",
      amount: 2800,
      date: new Date("2025-10-30T08:00:00"),
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: 7,
      type: "income",
      category: "Retail",
      description: "Product Sales - Skincare Bundle",
      amount: 156,
      date: new Date("2025-10-29T15:30:00"),
      status: "completed",
      method: "Credit Card",
    },
    {
      id: 8,
      type: "expense",
      category: "Marketing",
      description: "Social Media Advertising - October",
      amount: 320,
      date: new Date("2025-10-29T11:15:00"),
      status: "pending",
      method: "Credit Card",
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

  const formatTime = (date: any) => {
    return date?.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredTransactions = mockTransactions
    ?.filter((transaction) => {
      if (filterType !== "all" && transaction?.type !== filterType)
        return false;
      if (
        searchTerm &&
        !transaction?.description
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) &&
        !transaction?.category
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase())
      )
        return false;
      return true;
    })
    ?.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a?.date ? new Date(a.date).getTime() : 0;
        const dateB = b?.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "amount") return b?.amount - a?.amount;
      if (sortBy === "category") return a?.category?.localeCompare(b?.category);
      return 0;
    });

  const getTransactionIcon = (type: any) => {
    return type === "income" ? "ArrowUp" : "ArrowDown";
  };

  const getTransactionColor = (type: any) => {
    return type === "income" ? "text-success" : "text-error";
  };

  // type StatusKey = keyof typeof statusConfig;
  // "completed" | "pending" | "failed"
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Completed", color: "bg-success/10 text-success" },
      pending: { label: "Pending", color: "bg-warning/10 text-warning" },
      failed: { label: "Failed", color: "bg-error/10 text-error" },
    };

    // Type-safe lookup (if key exists, use it; otherwise default)
    const key =
      status in statusConfig
        ? (status as keyof typeof statusConfig)
        : "completed";

    const config = statusConfig[key];

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const categoryIcons = {
    "Service Payment": "Zap",
    "Package Deal": "Package",
    Membership: "Users",
    Retail: "ShoppingBag",
    Supplies: "Package2",
    Utilities: "Lightbulb",
    Staff: "User",
    Marketing: "Megaphone",
  };

  const totalIncome = filteredTransactions
    ?.filter((t) => t?.type === "income")
    ?.reduce((sum, t) => sum + t?.amount, 0);

  const totalExpenses = filteredTransactions
    ?.filter((t) => t?.type === "expense")
    ?.reduce((sum, t) => sum + t?.amount, 0);

  return (
    <div className="bg-primary-foreground rounded-lg border">
      <div className="p-6 pb-1 border-b">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Transaction History
            </h3>
            <p className="text-sm text-muted-foreground">
              {filteredTransactions?.length} transactions found
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              {/* <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" /> */}
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              // onValueChange={(e) => setDataView(e)}
              defaultValue="all"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              // onValueChange={(e) => setDataView(e)}
              defaultValue="date"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="amount">Sort by Amount</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* <select
              value={filterType}
              onChange={(e) => setFilterType(e?.target?.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
            </select> */}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-xs text-muted-foreground">Total Income</div>
          </div>
          <div className="text-center p-4 bg-error/10 rounded-lg">
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground">Total Expenses</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Desktop View - Table */}
        <div className="hidden md:block bg-green-00">
          <div className="overflow-x-auto">
            <Table>
              {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Transaction</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions?.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-muted/50 spa-transition"
                  >
                    
                    {/* Transaction */}
                    <TableCell className="font-medium">
                      <div className="font-medium text-foreground">
                        {transaction?.description}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {transaction?.id}
                      </div>
                    </TableCell>
                    
                    {/* Category */}
                    <TableCell>{transaction?.category}</TableCell>
                    
                    {/* Amount */}
                    <TableCell>
                      <span
                        className={`font-semibold ${getTransactionColor(
                          transaction?.type
                        )}`}
                      >
                        {transaction?.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction?.amount)}
                      </span>
                    </TableCell>
                    
                    {/* Methode */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {transaction?.method}
                      </span>
                    </TableCell>
                    
                    {/* Date */}
                    <TableCell className="text-righ">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {formatDate(transaction?.date)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(transaction?.date)}
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Status */}
                    <TableCell className="text-center">{getStatusBadge(transaction?.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">$2,500.00</TableCell>
                </TableRow>
              </TableFooter> */}
            </Table>
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4 bg-red-100">
          {filteredTransactions?.map((transaction) => (
            <div
              key={transaction?.id}
              className="p-4 border border-border rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      transaction?.type === "income"
                        ? "bg-success/10"
                        : "bg-error/10"
                    }`}
                  >
                    {/* <Icon 
                      name={getTransactionIcon(transaction?.type)} 
                      size={16} 
                      className={getTransactionColor(transaction?.type)} 
                    /> */}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {transaction?.description}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {/* <Icon 
                        name={categoryIcons?.[transaction?.category] || 'Circle'} 
                        size={14} 
                        className="text-muted-foreground" 
                      /> */}
                      <span className="text-xs text-muted-foreground">
                        {transaction?.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold text-sm ${getTransactionColor(
                      transaction?.type
                    )}`}
                  >
                    {transaction?.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction?.amount)}
                  </div>
                  {getStatusBadge(transaction?.status)}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span>
                  {formatDate(transaction?.date)} at{" "}
                  {formatTime(transaction?.date)}
                </span>
                <span>{transaction?.method}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions?.length === 0 && (
          <div className="text-center py-12">
            {/* <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" /> */}
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
