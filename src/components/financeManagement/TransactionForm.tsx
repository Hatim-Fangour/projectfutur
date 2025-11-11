import React, { useState } from "react";

const TransactionForm = ({ isOpen, onClose, transactionType }: any) => {
  const [formData, setFormData] = useState({
    type: transactionType || "income",
    description: "",
    amount: "",
    category: "",
    date: new Date()?.toISOString()?.split("T")?.[0],
    paymentMethod: "credit_card",
    notes: "",
    recurring: false,
    recurringFrequency: "monthly",
  });

  const incomeCategories = [
    { value: "service_payment", label: "Service Payment", icon: "Zap" },
    { value: "package_deal", label: "Package Deal", icon: "Package" },
    { value: "membership", label: "Membership Fee", icon: "Users" },
    { value: "retail", label: "Retail Sales", icon: "ShoppingBag" },
    { value: "gift_card", label: "Gift Card Sales", icon: "Gift" },
    { value: "consultation", label: "Consultation Fee", icon: "MessageCircle" },
    { value: "workshop", label: "Workshop/Class", icon: "GraduationCap" },
    { value: "other_income", label: "Other Income", icon: "Plus" },
  ];

  const expenseCategories = [
    { value: "staff_salary", label: "Staff Salary", icon: "Users" },
    { value: "supplies", label: "Supplies", icon: "Package2" },
    { value: "utilities", label: "Utilities", icon: "Lightbulb" },
    { value: "rent", label: "Rent", icon: "Home" },
    { value: "marketing", label: "Marketing", icon: "Megaphone" },
    { value: "equipment", label: "Equipment", icon: "Settings" },
    { value: "insurance", label: "Insurance", icon: "Shield" },
    {
      value: "professional_services",
      label: "Professional Services",
      icon: "Briefcase",
    },
    { value: "maintenance", label: "Maintenance", icon: "Wrench" },
    { value: "other_expense", label: "Other Expense", icon: "Minus" },
  ];

  const paymentMethods = [
    { value: "credit_card", label: "Credit Card", icon: "CreditCard" },
    { value: "cash", label: "Cash", icon: "Banknote" },
    { value: "bank_transfer", label: "Bank Transfer", icon: "Building2" },
    { value: "check", label: "Check", icon: "FileText" },
    { value: "digital_wallet", label: "Digital Wallet", icon: "Smartphone" },
    { value: "auto_pay", label: "Auto Pay", icon: "Repeat" },
  ];

  const categories =
    formData?.type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = (e) => {
    e?.preventDefault();

    // Validate form
    if (!formData?.description || !formData?.amount || !formData?.category) {
      alert("Please fill in all required fields");
      return;
    }

    // Process form submission
    console.log("Transaction Data:", formData);

    // Close modal and reset form
    onClose();
    setFormData({
      type: transactionType || "income",
      description: "",
      amount: "",
      category: "",
      date: new Date()?.toISOString()?.split("T")?.[0],
      paymentMethod: "credit_card",
      notes: "",
      recurring: false,
      recurringFrequency: "monthly",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //   if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto spa-shadow-elevated">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  formData?.type === "income" ? "bg-success/10" : "bg-error/10"
                }`}
              >
                {/* <Icon 
                  name={formData?.type === 'income' ? 'TrendingUp' : 'TrendingDown'} 
                  size={20} 
                  className={formData?.type === 'income' ? 'text-success' : 'text-error'} 
                /> */}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  Add {formData?.type === "income" ? "Income" : "Expense"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Record a new financial transaction
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg spa-transition"
            >
              X
              {/* <Icon name="X" size={20} className="text-muted-foreground" /> */}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Transaction Type
            </label>
            <div className="flex items-center space-x-1 bg-muted rounded-lg">
              <button
                onClick={() => handleInputChange("type", "income")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md spa-transition flex-1 justify-center 
                   
                   ${
                     formData?.type === "income"
                       ? "bg-primary text-primary-foreground"
                       : "hover:bg-muted"
                   }`}
                //   title={option?.label}
              >
                income
                {/* {option?.icon} */}
                {/* <Icon name={option?.icon} size={16} /> */}
              </button>
              <button
                onClick={() => handleInputChange("type", "expense")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md spa-transition flex-1 justify-center  ${
                  formData?.type === "expense"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                //   title={option?.label}
              >
                expense
                {/* {option?.icon} */}
                {/* <Icon name={option?.icon} size={16} /> */}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <input
                type="text"
                value={formData?.description}
                onChange={(e) =>
                  handleInputChange("description", e?.target?.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={`Enter ${formData?.type} description`}
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData?.amount}
                  onChange={(e) =>
                    handleInputChange("amount", e?.target?.value)
                  }
                  className="w-full pl-8 pr-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData?.date}
                onChange={(e) => handleInputChange("date", e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                value={formData?.category}
                onChange={(e) =>
                  handleInputChange("category", e?.target?.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category?.value} value={category?.value}>
                    {category?.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Method
              </label>
              <select
                value={formData?.paymentMethod}
                onChange={(e) =>
                  handleInputChange("paymentMethod", e?.target?.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {paymentMethods?.map((method) => (
                  <option key={method?.value} value={method?.value}>
                    {method?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData?.notes}
              onChange={(e) => handleInputChange("notes", e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              placeholder="Add any additional notes or details..."
            />
          </div>

          {/* Recurring Transaction */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData?.recurring}
                onChange={(e) =>
                  handleInputChange("recurring", e?.target?.checked)
                }
                className="rounded border-border text-primary focus:ring-ring"
              />
              <label
                htmlFor="recurring"
                className="text-sm font-medium text-foreground"
              >
                This is a recurring transaction
              </label>
            </div>

            {formData?.recurring && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recurring Frequency
                </label>
                <select
                  value={formData?.recurringFrequency}
                  onChange={(e) =>
                    handleInputChange("recurringFrequency", e?.target?.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted spa-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg spa-transition text-white ${
                formData?.type === "income"
                  ? "bg-success hover:bg-success/90"
                  : "bg-error hover:bg-error/90"
              }`}
            >
              Add {formData?.type === "income" ? "Income" : "Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
