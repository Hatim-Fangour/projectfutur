"use client";


import React, { useState } from 'react'

const SavingsGoals = () => {
      const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'equipment'
  });

  const savingsGoals = [
    {
      id: 1,
      title: 'New Massage Equipment',
      description: 'Professional massage tables and aromatherapy diffusers',
      targetAmount: 15000,
      currentAmount: 8500,
      deadline: new Date('2025-12-31'),
      category: 'equipment',
      priority: 'high',
      monthlyTarget: 1083,
      icon: 'Settings'
    },
    {
      id: 2,
      title: 'Emergency Fund',
      description: '6 months of operating expenses',
      targetAmount: 50000,
      currentAmount: 32000,
      deadline: new Date('2026-06-30'),
      category: 'emergency',
      priority: 'high',
      monthlyTarget: 2250,
      icon: 'Shield'
    },
    {
      id: 3,
      title: 'Spa Renovation',
      description: 'Refresh interior design and upgrade facilities',
      targetAmount: 25000,
      currentAmount: 5200,
      deadline: new Date('2026-03-15'),
      category: 'renovation',
      priority: 'medium',
      monthlyTarget: 1485,
      icon: 'Home'
    },
    {
      id: 4,
      title: 'Staff Training Program',
      description: 'Advanced certification courses for therapists',
      targetAmount: 8000,
      currentAmount: 2800,
      deadline: new Date('2025-08-30'),
      category: 'training',
      priority: 'medium',
      monthlyTarget: 577,
      icon: 'GraduationCap'
    },
    {
      id: 5,
      title: 'Marketing Campaign',
      description: 'Annual marketing budget for growth',
      targetAmount: 12000,
      currentAmount: 7200,
      deadline: new Date('2025-12-01'),
      category: 'marketing',
      priority: 'low',
      monthlyTarget: 480,
      icon: 'Megaphone'
    }
  ];

  const formatCurrency = (amount:number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (date:any) => {
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateProgress = (current:any, target:any) => {
    return Math.min((current / target) * 100, 100);
  };
const getDaysRemaining = (deadline: Date | string): number => {
  // ensure 'deadline' is a Date object
  const deadlineDate = typeof deadline === "string" ? new Date(deadline) : deadline;

  // if invalid date, return 0 or handle gracefully
  if (isNaN(deadlineDate.getTime())) return 0;

  const today = new Date();

  // calculate difference in milliseconds
  const timeDiff = deadlineDate.getTime() - today.getTime();

  // convert to full days
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
};

  const getPriorityColor = (priority:any) => {
    switch (priority) {
      case 'high': return 'bg-error text-error-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = (progress:any) => {
    if (progress >= 90) return 'var(--color-success)';
    if (progress >= 70) return 'var(--color-primary)';
    if (progress >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const categoryOptions = [
    { value: 'equipment', label: 'Equipment', icon: 'Settings' },
    { value: 'emergency', label: 'Emergency Fund', icon: 'Shield' },
    { value: 'renovation', label: 'Renovation', icon: 'Home' },
    { value: 'training', label: 'Training', icon: 'GraduationCap' },
    { value: 'marketing', label: 'Marketing', icon: 'Megaphone' },
    { value: 'expansion', label: 'Expansion', icon: 'Building' }
  ];

  const handleAddGoal = (e:any) => {
    e?.preventDefault();
    // Handle adding new goal logic here
    console.log('New goal:', newGoal);
    setShowAddGoal(false);
    setNewGoal({ title: '', targetAmount: '', deadline: '', category: 'equipment' });
  };

  const totalSavingsTarget = savingsGoals?.reduce((sum, goal) => sum + goal?.targetAmount, 0);
  const totalCurrentSavings = savingsGoals?.reduce((sum, goal) => sum + goal?.currentAmount, 0);
  const totalProgress = (totalCurrentSavings / totalSavingsTarget) * 100;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Total Savings</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(totalCurrentSavings)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              {/* <Icon name="PiggyBank" size={24} className="text-primary" /> */}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(totalSavingsTarget - totalCurrentSavings)} remaining
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Total Goals</h3>
              <p className="text-2xl font-bold text-accent mt-1">{savingsGoals?.length}</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              {/* <Icon name="Target" size={24} className="text-accent" /> */}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Active savings goals</div>
        </div>

        <div className="bg-card rounded-lg p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Overall Progress</h3>
              <p className="text-2xl font-bold text-success mt-1">{totalProgress?.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              {/* <Icon name="TrendingUp" size={24} className="text-success" /> */}
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full" 
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 spa-shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Monthly Target</h3>
              <p className="text-2xl font-bold text-warning mt-1">
                {formatCurrency(savingsGoals?.reduce((sum, goal) => sum + goal?.monthlyTarget, 0))}
              </p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              {/* <Icon name="Calendar" size={24} className="text-warning" /> */}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Combined monthly savings</div>
        </div>
      </div>

      {/* Add New Goal Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground">Savings Goals</h3>
        <button
          onClick={() => setShowAddGoal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 spa-transition flex items-center space-x-2"
        >
          {/* <Icon name="Plus" size={16} /> */}
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {savingsGoals?.map((goal) => {
          const progress = calculateProgress(goal?.currentAmount, goal?.targetAmount);
          const daysRemaining = getDaysRemaining(goal?.deadline);
          const isOverdue = daysRemaining < 0;
          
          return (
            <div key={goal?.id} className="bg-card rounded-lg p-6 spa-shadow-soft">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {/* <Icon name={goal?.icon} size={20} className="text-primary" /> */}
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{goal?.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal?.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal?.priority)}`}>
                  {goal?.priority?.toUpperCase()}
                </span>
              </div>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(goal?.currentAmount)} / {formatCurrency(goal?.targetAmount)}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: getProgressColor(progress) }}>
                    {progress?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="h-3 rounded-full spa-transition" 
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: getProgressColor(progress)
                    }}
                  ></div>
                </div>
              </div>

              {/* Goal Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="font-semibold text-foreground">
                    {formatCurrency(goal?.targetAmount - goal?.currentAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Monthly Target</div>
                  <div className="font-semibold text-foreground">
                    {formatCurrency(goal?.monthlyTarget)}
                  </div>
                </div>
              </div>

              {/* Deadline Info */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  {/* <Icon name="Calendar" size={16} className="text-muted-foreground" /> */}
                  <span className="text-sm text-muted-foreground">
                    Deadline: {formatDate(goal?.deadline)}
                  </span>
                </div>
                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-error' : 'text-muted-foreground'}`}>
                  {/* <Icon name="Clock" size={16} /> */}
                  <span className="text-sm font-medium">
                    {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4">
                <button className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 spa-transition text-sm font-medium">
                  Add Funds
                </button>
                <button className="flex-1 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 spa-transition text-sm font-medium">
                  Edit Goal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4 spa-shadow-elevated">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-card-foreground">Add New Savings Goal</h3>
              <button
                onClick={() => setShowAddGoal(false)}
                className="p-2 hover:bg-muted rounded-lg spa-transition"
              >
                {/* <Icon name="X" size={20} className="text-muted-foreground" /> */}
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal?.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e?.target?.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter goal title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Amount
                </label>
                <input
                  type="number"
                  value={newGoal?.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e?.target?.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter target amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newGoal?.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e?.target?.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={newGoal?.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e?.target?.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {categoryOptions?.map((option) => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted spa-transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 spa-transition"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavingsGoals