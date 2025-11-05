"use client";

import React, { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Tooltip } from '../ui/tooltip';

const ExpenseBreakdown = ({ timeRange }:any) => {
      const [viewType, setViewType] = useState('pie');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const expenseData = [
    {
      category: 'Staff Salaries',
      amount: 8500,
      percentage: 46.4,
      color: 'var(--color-primary)',
      icon: 'Users',
      trend: '+5.2%',
      trendType: 'negative',
      items: [
        { name: 'Lead Therapist', amount: 3500 },
        { name: 'Massage Therapists (2)', amount: 4200 },
        { name: 'Receptionist', amount: 800 }
      ]
    },
    {
      category: 'Utilities',
      amount: 2300,
      percentage: 12.6,
      color: 'var(--color-warning)',
      icon: 'Lightbulb',
      trend: '+2.1%',
      trendType: 'negative',
      items: [
        { name: 'Electricity', amount: 1200 },
        { name: 'Water', amount: 400 },
        { name: 'Internet & Phone', amount: 700 }
      ]
    },
    {
      category: 'Supplies',
      amount: 1800,
      percentage: 9.8,
      color: 'var(--color-success)',
      icon: 'Package2',
      trend: '-3.4%',
      trendType: 'positive',
      items: [
        { name: 'Essential Oils', amount: 650 },
        { name: 'Towels & Linens', amount: 450 },
        { name: 'Cleaning Products', amount: 700 }
      ]
    },
    {
      category: 'Marketing',
      amount: 1200,
      percentage: 6.5,
      color: 'var(--color-error)',
      icon: 'Megaphone',
      trend: '+12.8%',
      trendType: 'negative',
      items: [
        { name: 'Social Media Ads', amount: 600 },
        { name: 'Print Materials', amount: 300 },
        { name: 'Website Maintenance', amount: 300 }
      ]
    },
    {
      category: 'Rent',
      amount: 2800,
      percentage: 15.3,
      color: 'var(--color-accent)',
      icon: 'Home',
      trend: '0%',
      trendType: 'neutral',
      items: [
        { name: 'Monthly Rent', amount: 2500 },
        { name: 'Property Insurance', amount: 300 }
      ]
    },
    {
      category: 'Equipment',
      amount: 900,
      percentage: 4.9,
      color: 'var(--color-secondary)',
      icon: 'Settings',
      trend: '-8.2%',
      trendType: 'positive',
      items: [
        { name: 'Maintenance', amount: 400 },
        { name: 'New Equipment', amount: 500 }
      ]
    },
    {
      category: 'Other',
      amount: 820,
      percentage: 4.5,
      color: 'var(--color-muted)',
      icon: 'MoreHorizontal',
      trend: '+1.5%',
      trendType: 'negative',
      items: [
        { name: 'Licenses & Permits', amount: 320 },
        { name: 'Professional Services', amount: 500 }
      ]
    }
  ];

  const totalExpenses = expenseData?.reduce((sum, item) => sum + item?.amount, 0);

  const formatCurrency = (amount:number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const getTrendColor = (trendType:any) => {
    if (trendType === 'positive') return 'text-success';
    if (trendType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getTrendIcon = (trendType:any) => {
    if (trendType === 'positive') return 'TrendingDown';
    if (trendType === 'negative') return 'TrendingUp';
    return 'Minus';
  };

  const CustomTooltip = ({ active, payload }:any) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 spa-shadow-elevated">
          <p className="font-medium text-popover-foreground mb-2">{data?.category}</p>
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
  return (
      <div className="space-y-8">
      {/* Overview Card */}
      <div className="bg-card rounded-lg spa-shadow-soft">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Expense Breakdown</h3>
              <p className="text-sm text-muted-foreground">
                Detailed analysis of business expenses
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewType('pie')}
                className={`p-2 rounded-lg spa-transition ${
                  viewType === 'pie' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {/* <Icon name="PieChart" size={16} /> */}
              </button>
              <button
                onClick={() => setViewType('bar')}
                className={`p-2 rounded-lg spa-transition ${
                  viewType === 'bar' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {/* <Icon name="BarChart3" size={16} /> */}
              </button>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-error mb-2">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-sm text-muted-foreground">Total Monthly Expenses</div>
          </div>
        </div>

        <div className="p-6">
          <div className="h-80" aria-label="Expense Breakdown Chart">
            <ResponsiveContainer width="100%" height="100%">
              {viewType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {expenseData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  {/* <Tooltip content={<CustomTooltip />} /> */}
                </PieChart>
              ) : (
                <BarChart data={expenseData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    stroke="var(--color-muted-foreground)" 
                    fontSize={12}
                    width={100}
                  />
                  {/* <Tooltip content={<CustomTooltip />} /> */}
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {expenseData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {expenseData?.map((category, index) => (
          <div 
            key={index} 
            className="bg-card rounded-lg p-6 spa-shadow-soft cursor-pointer hover:spa-shadow-elevated spa-transition"
            // onClick={() => setSelectedCategory(selectedCategory === index ? null : index)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${category?.color}20` }}
                >
                  {/* <Icon 
                    name={category?.icon} 
                    size={20} 
                    style={{ color: category?.color }} 
                  /> */}
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground">{category?.category}</h4>
                  <p className="text-sm text-muted-foreground">{category?.percentage}% of total</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-card-foreground">
                  {formatCurrency(category?.amount)}
                </div>
                <div className="flex items-center space-x-1 justify-end">
                  {/* <Icon 
                    name={getTrendIcon(category?.trendType)} 
                    size={14} 
                    className={getTrendColor(category?.trendType)} 
                  /> */}
                  <span className={`text-sm ${getTrendColor(category?.trendType)}`}>
                    {category?.trend}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: `${category?.percentage}%`,
                    backgroundColor: category?.color 
                  }}
                ></div>
              </div>
            </div>

            {/* Expandable Details */}
            {selectedCategory === index && (
              <div className="mt-4 pt-4 border-t border-border">
                <h5 className="font-medium text-card-foreground mb-3">Expense Breakdown</h5>
                <div className="space-y-2">
                  {category?.items?.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item?.name}</span>
                      <span className="text-sm font-medium text-card-foreground">
                        {formatCurrency(item?.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center mt-4">
              {/* <Icon 
                name={selectedCategory === index ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-muted-foreground" 
              /> */}
            </div>
          </div>
        ))}
      </div>

      {/* Expense Trends */}
      <div className="bg-card rounded-lg p-6 spa-shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Expense Trends</h3>
            <p className="text-sm text-muted-foreground">Month-over-month comparison</p>
          </div>
          {/* <Icon name="TrendingUp" size={20} className="text-muted-foreground" /> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-error/10 rounded-lg">
            <div className="text-2xl font-semibold text-error mb-1">+8.7%</div>
            <div className="text-sm text-muted-foreground">Overall Increase</div>
            <p className="text-xs text-muted-foreground mt-2">vs last month</p>
          </div>
          <div className="text-center p-4 bg-warning/10 rounded-lg">
            <div className="text-2xl font-semibold text-warning mb-1">3</div>
            <div className="text-sm text-muted-foreground">Categories Increased</div>
            <p className="text-xs text-muted-foreground mt-2">above budget</p>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <div className="text-2xl font-semibold text-success mb-1">2</div>
            <div className="text-sm text-muted-foreground">Categories Decreased</div>
            <p className="text-xs text-muted-foreground mt-2">under budget</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseBreakdown