"use client";

import BudgetManager from "@/components/financeManagement/BudgetManager";
import ExpenseBreakdown from "@/components/financeManagement/ExpenseBreakdown";
import SavingsGoals from "@/components/financeManagement/SavingsGoals";
import TransactionForm from "@/components/financeManagement/TransactionForm";
import TransactionList from "@/components/financeManagement/TransactionList";
import OverViewFinManag from "@/components/OverViewFinManag";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";

const page = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionType, setTransactionType] = useState("income");
  useEffect(() => {}, []); // Before any returns
  const handleAddTransaction = (type) => {
    setTransactionType(type);
    setShowAddModal(true);
  };

  // Conditional rendering AFTER all hooks
  if (!timeRange) return null;
  return (
    <div className="grid grid-cols-1 gap-4  items-start pb-6">
      {/* Header */}
      <div className="scroll-m-20 border-b pb-2 flex w-full justify-between items-center">
        <div className="leftHeaderPart">
          <h1 className="text-3xl font-semibold tracking-tight first:mt-0">
            Financial Management
          </h1>
          <h2>Saturday, November 1, 2025 • 07:43 PM</h2>
        </div>
        <div className="rightHeaderPart">
          <div className="action grid grid-cols-3 justify-end gap-2">
            <Button className="" onClick={() => handleAddTransaction("income")}>
              View
            </Button>
            <Button className="">Download Report</Button>

            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button variant="outline">Add Transaction</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  {/* <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader> */}
                  <div className="grid gap-4">
                    <TransactionForm />
                  </div>
                </DialogContent>
              </form>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="incomes&expenses grid gap-6 rounded-lg h-full">
        <Tabs defaultValue="overview">
          <TabsList className="h-10">
            <TabsTrigger value="overview" className="px-8">
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="px-8">
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="px-8">
              <span>Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="incomes" className="px-8">
              <span>Incomes</span>
            </TabsTrigger>
            <TabsTrigger value="savings" className="px-8">
              <span>Savings</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="px-8">
              <span>Budget</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverViewFinManag timeRange={timeRange} />
          </TabsContent>
          <TabsContent value="transactions">
            <TransactionList />
          </TabsContent>
          <TabsContent value="expenses">
            <ExpenseBreakdown />
          </TabsContent>
          <TabsContent value="savings">
            <SavingsGoals />
          </TabsContent>
          <TabsContent value="budget">
            <BudgetManager />
          </TabsContent>
        </Tabs>

        {/* Financial Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-primary-foreground rounded-lg border p-4">
            {/* Spending Analysis */}
            <div className="bg-card rounded-lg p-6 spa-shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Spending Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Top expense categories
                  </p>
                </div>
                {/* <Icon name="PieChart" size={20} className="text-muted-foreground" /> */}
              </div>
              <div className="space-y-4">
                {[
                  {
                    category: "Staff Salaries",
                    amount: "$8,500",
                    percentage: 46,
                    color: "bg-primary",
                  },
                  {
                    category: "Utilities",
                    amount: "$2,300",
                    percentage: 13,
                    color: "bg-success",
                  },
                  {
                    category: "Supplies",
                    amount: "$1,800",
                    percentage: 10,
                    color: "bg-warning",
                  },
                  {
                    category: "Marketing",
                    amount: "$1,200",
                    percentage: 7,
                    color: "bg-error",
                  },
                ]?.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {item?.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item?.amount}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`${item?.color} h-2 rounded-full`}
                          style={{ width: `${item?.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-12">
                        {item?.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-primary-foreground rounded-lg border p-4">
            {/* Financial Health Score */}
            <div className="bg-card rounded-lg p-6 spa-shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Financial Health
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Overall business score
                  </p>
                </div>
                {/* <Icon name="Shield" size={20} className="text-muted-foreground" /> */}
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-success mb-2">87</div>
                <div className="text-sm text-muted-foreground">
                  Excellent Health
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { metric: "Cash Flow", score: 92, status: "excellent" },
                  { metric: "Profit Margin", score: 85, status: "good" },
                  { metric: "Expense Control", score: 78, status: "good" },
                  { metric: "Savings Rate", score: 90, status: "excellent" },
                ]?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {item?.metric}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {item?.score}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item?.status === "excellent"
                            ? "bg-success"
                            : item?.status === "good"
                            ? "bg-warning"
                            : "bg-error"
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-primary-foreground rounded-lg border p-4">
            {/* Recent Activity */}
            <div className="bg-card rounded-lg p-6 spa-shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Recent Activity
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Latest transactions
                  </p>
                </div>
                {/* <Icon name="Activity" size={20} className="text-muted-foreground" /> */}
              </div>
              <div className="space-y-4">
                {[
                  {
                    type: "income",
                    description: "Service Payment",
                    amount: "+$350",
                    time: "2 hours ago",
                    color: "text-success",
                  },
                  {
                    type: "expense",
                    description: "Office Supplies",
                    amount: "-$89",
                    time: "4 hours ago",
                    color: "text-error",
                  },
                  {
                    type: "income",
                    description: "Package Deal",
                    amount: "+$1,200",
                    time: "6 hours ago",
                    color: "text-success",
                  },
                  {
                    type: "expense",
                    description: "Utility Bill",
                    amount: "-$245",
                    time: "1 day ago",
                    color: "text-error",
                  },
                ]?.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity?.type === "income"
                          ? "bg-success/10"
                          : "bg-error/10"
                      }`}
                    >
                      {/* <Icon 
                        name={activity?.type === 'income' ? 'ArrowUp' : 'ArrowDown'} 
                        size={16} 
                        className={activity?.type === 'income' ? 'text-success' : 'text-error'} 
                      /> */}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {activity?.description}
                        </span>
                        <span
                          className={`text-sm font-semibold ${activity?.color}`}
                        >
                          {activity?.amount}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activity?.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm font-medium text-primary hover:text-primary/80 spa-transition">
                View All Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
