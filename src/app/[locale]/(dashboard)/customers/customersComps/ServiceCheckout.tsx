// @ts-nocheck
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Package, DollarSign } from "lucide-react"

const ServiceCheckout = ({ items, onConfirm, onCancel }:any) => {
     const [step, setStep] = useState<"review" | "confirm">("review")
  const [isProcessing, setIsProcessing] = useState(false)

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const price = item.promotionalPrice || item.regularPrice
      return sum + price * item.quantity
    }, 0)
  }

  const subtotal = calculateTotal()
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleConfirm = async () => {
    setIsProcessing(true)
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const assignedServices = items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.name.split(" ").slice(0, 2).join(" "),
      totalSessions: item.sessions * item.quantity,
      remainingSessions: item.sessions * item.quantity,
      purchaseDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString().split("T")[0],
      price: (item.promotionalPrice || item.regularPrice) * item.quantity,
      status: "active",
      description: `${item.sessions * item.quantity} sessions purchased`,
    }))

    onConfirm(assignedServices)
    setIsProcessing(false)
  }
  return (
    <div> <div className="w-full max-w-2xl mx-auto">
      {step === "review" ? (
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Order Review</h1>
            <p className="text-muted-foreground text-lg">Confirm your service packages before purchase</p>
          </div>

          {/* Items Review */}
          <div className="space-y-3 mb-6">
            {items.map((item) => {
              const price = item.promotionalPrice || item.regularPrice
              const itemTotal = price * item.quantity

              return (
                <Card key={item.id} className="border-accent/20 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-accent" />
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          {item.promotionalPrice && (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Sale</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.sessions} sessions per package</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Unit: </span>
                            {item.promotionalPrice ? (
                              <span className="font-semibold text-accent">
                                ${item.promotionalPrice}{" "}
                                <span className="line-through text-muted-foreground text-xs">${item.regularPrice}</span>
                              </span>
                            ) : (
                              <span className="font-semibold text-foreground">${item.regularPrice}</span>
                            )}
                          </div>
                          <span className="text-muted-foreground">× {item.quantity}</span>
                          <span className="font-bold text-foreground">${itemTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Summary */}
          <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5 mb-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-accent">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={onCancel} variant="outline" className="flex-1 h-11 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={() => setStep("confirm")}
              className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Confirm Purchase
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">Confirm Purchase</h1>
            <p className="text-muted-foreground text-lg">Complete your service package purchase</p>
          </div>

          {/* Confirmation Card */}
          <Card className="border-accent/20 bg-card/50 mb-6">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Services will be assigned to this customer immediately after confirmation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Packages to Purchase</span>
                  <span className="font-bold text-foreground">{items.length}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">Total Sessions</span>
                  <span className="font-bold text-foreground">
                    {items.reduce((sum, item) => sum + item.sessions * item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-bold text-foreground">Amount to Charge</span>
                  <span className="text-2xl font-bold text-accent">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-4 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm mb-1">Ready to Process</p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    The customer will receive these services assigned to their account with a 90-day expiration date.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={() => setStep("review")} variant="outline" className="flex-1 h-11" disabled={isProcessing}>
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white"
            >
              {isProcessing ? "Processing..." : "Confirm & Assign Services"}
            </Button>
          </div>
        </>
      )}
    </div></div>
  )
}

export default ServiceCheckout