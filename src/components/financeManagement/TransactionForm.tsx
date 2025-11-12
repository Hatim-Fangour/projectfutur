import React, { useState } from "react";
import { Input } from "../ui/input";
import { Field, FieldLabel } from "../ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

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
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  //   if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto spa-shadow-elevated">
        {/* Header */}
        <div className="p-4 border-b ">
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
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => handleInputChange("type", "income")}
                className={`flex items-center space-x-2 px-4 py-1 rounded-md spa-transition flex-1 justify-center 
                   
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
                className={`flex items-center space-x-2 px-4 py-1 rounded-md spa-transition flex-1 justify-center  ${
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

          {/* main form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="md:col-span-2">
              <Field>
                <FieldLabel htmlFor="checkout-7j9-description-43j">
                  Description *
                </FieldLabel>
                <Input
                  id="checkout-7j9-description-43j"
                  type="text"
                  value={formData?.description}
                  onChange={(e) =>
                    handleInputChange("description", e?.target?.value)
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={`Enter ${formData?.type} description`}
                  required
                />
              </Field>
            </div>

            {/* Amount */}
            <div>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-amount-43j">
                  Amount ($) *
                </FieldLabel>
                <Input
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
              </Field>
            </div>

            {/* Date */}
            <div>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-date-43j">Date *</FieldLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="checkout-7j9-date-43j"
                      className="w-48 justify-between font-normal"
                    >
                      {date ? date.toLocaleDateString() : "Select date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="overflow-hidden p-0 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setDate(date);
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              {/* <input
                type="date"
                value={formData?.date}
                onChange={(e) => handleInputChange("date", e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              /> */}
            </div>

            {/* Category */}
            <div>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-category-43j">
                  Category *
                </FieldLabel>
                <Select>
                  <SelectTrigger
                    className="w-full"
                    id="checkout-7j9-category-43j"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent
                    //  value={formData?.category}
                    onChange={(e) =>
                      handleInputChange("category", e?.target?.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    // required
                  >
                    <SelectGroup>
                      {categories?.map((category) => (
                        <SelectItem
                          key={category?.value}
                          value={category?.value}
                        >
                          {category?.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Payment Method */}
            <div>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-payment-method-43j">
                  Payment Method
                </FieldLabel>

                <Select>
                  <SelectTrigger className="w-full" id="checkout-7j9-payment-method-43j">
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent
                    //  value={formData?.category}
                    onChange={(e) =>
                      handleInputChange("category", e?.target?.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    // required
                  >
                    <SelectGroup>
                      {paymentMethods?.map((method) => (
                        <SelectItem key={method?.value} value={method?.value}>
                          {method?.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {/* <select
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
              </select> */}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Field>
              <FieldLabel htmlFor="checkout-7j9-notes-43j">
                Notes (Optional)
              </FieldLabel>
              <Textarea
              id="checkout-7j9-notes-43j"
                placeholder="Add any additional notes or details..."
                rows={3}
                value={formData?.notes}
                onChange={(e) => handleInputChange("notes", e?.target?.value)}
              />
            </Field>

            {/* <textarea
              value={formData?.notes}
              onChange={(e) => handleInputChange("notes", e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              placeholder="Add any additional notes or details..."
            /> */}
          </div>

          {/* Recurring Transaction */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Checkbox
                id="reccuring"
                checked={formData?.recurring}
                onCheckedChange={(value) =>
                  handleInputChange("recurring", value)
                }
              />
              <Label htmlFor="reccuring">This is a recurring transaction</Label>
              
            </div>

            {formData?.recurring && (
              <div>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-recurring-43j">
                    Recurring Frequency
                  </FieldLabel>
                  <Select>
                    <SelectTrigger className="w-full" id="checkout-7j9-recurring-43j">
                      <SelectValue placeholder="Select a frequency" />
                    </SelectTrigger>
                    <SelectContent
                      //   value={formData?.recurringFrequency}
                      onChange={(e) =>
                        handleInputChange(
                          "recurringFrequency",
                          e?.target?.value
                        )
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      // required
                    >
                      <SelectGroup>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

               
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t ">
            <Button
              
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg "
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 px-4 py-2 border rounded-lg ${
                formData?.type === "income"
                  ? "bg-red-900 text-white"
                  : "bg-green-900 text-white"
              }`}
            >
              Add {formData?.type === "income" ? "Income" : "Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
