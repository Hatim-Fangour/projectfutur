"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowRight } from "lucide-react";

const ShoppingCartComponent = ({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
}: any) => {
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const price = item.promotionalPrice || item.regularPrice;
      return sum + price * item.quantity;
    }, 0);
  };

  const calculateSavings = () => {
    return items.reduce((sum, item) => {
      if (item.promotionalPrice) {
        const saved =
          (item.regularPrice - item.promotionalPrice) * item.quantity;
        return sum + saved;
      }
      return sum;
    }, 0);
  };

  const totalSessions = items.reduce(
    (sum, item) => sum + item.sessions * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <Card className="border-accent/20 bg-card/50">
        <CardContent className="p-12 text-center">
          <ArrowRight className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">Your cart is empty</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add services from the catalog to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  const subtotal = calculateTotal();
  const savings = calculateSavings();
  const taxRate = 0.1;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const price = item.promotionalPrice || item.regularPrice;
          const itemTotal = price * item.quantity;

          return (
            <Card key={item.id} className="border-accent/20 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">
                        {item.name}
                      </h4>
                      {item.promotionalPrice && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                          Sale
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.sessions} sessions per package
                    </p>

                    {/* Pricing Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Unit Price
                        </p>
                        {item.promotionalPrice ? (
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-accent">
                              ${item.promotionalPrice}
                            </span>
                            <span className="text-xs line-through text-muted-foreground">
                              ${item.regularPrice}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-foreground">
                            ${item.regularPrice}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Quantity
                        </p>
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            onUpdateQuantity(
                              item.id,
                              Number.parseInt(e.target.value)
                            )
                          }
                          className="px-2 py-1 rounded border border-border bg-background text-sm font-medium"
                        >
                          {[1, 2, 3, 4, 5].map((qty) => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Total
                        </p>
                        <p className="font-bold text-foreground text-lg">
                          ${itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cart Summary */}
      <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items Summary */}
          <div className="bg-accent/5 rounded-lg p-3 border border-accent/20">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Items in cart:</span>
              <span className="font-semibold text-foreground">
                {items.length} packages
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total sessions:</span>
              <span className="font-semibold text-foreground">
                {totalSessions} sessions
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {savings > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Savings
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  -${savings.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span className="font-medium text-foreground">
                ${tax.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-2xl font-bold text-accent">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={onCheckout}
            className="w-full gap-2 bg-accent hover:bg-accent/90 text-white h-12"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingCartComponent;
