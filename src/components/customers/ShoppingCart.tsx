"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowRight, Package } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ServiceCatalog from "./ServiceCatalog";
import ShoppingCartComponent from "./ShoppingCartComponent";
import ServiceCheckout from "./ServiceCheckout";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [activeTab, setActiveTab] = useState("catalog");

  const handleAddToCart = (service: any, quantity: number) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === service.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...service, quantity }];
    });
  };

  const handleRemoveItem = (serviceId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== serviceId));
  };

  const handleUpdateQuantity = (serviceId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === serviceId ? { ...item, quantity } : item))
    );
  };

  const handleCheckout = () => {
    setActiveTab("checkout");
  };

  const handleConfirmPurchase = (assignedServices: AssignedService[]) => {
    onServicesAssigned?.(assignedServices);
    // Reset cart
    setCartItems([]);
    setActiveTab("catalog");
    // Show success message
    alert("Services assigned successfully!");
  };

  const handleCancelCheckout = () => {
    setActiveTab("cart");
  };
  return (
    <div>
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 backdrop-blur p-1">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger
              value="cart"
              className="flex items-center gap-2 relative"
            >
              {/* <ShoppingCart className="w-4 h-4" /> */}
              <span className="hidden sm:inline">Cart</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="checkout"
              disabled={cartItems.length === 0}
              className="flex items-center gap-2"
            >
              <span className="hidden sm:inline">Checkout</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            <ServiceCatalog
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
            />
          </TabsContent>

          <TabsContent value="cart">
            <div className="max-w-4xl mx-auto">
              <ShoppingCartComponent
                items={cartItems}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
                onCheckout={handleCheckout}
              />
            </div>
          </TabsContent>

          <TabsContent value="checkout">
            <ServiceCheckout
              items={cartItems}
              onConfirm={handleConfirmPurchase}
              onCancel={handleCancelCheckout}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShoppingCart;
