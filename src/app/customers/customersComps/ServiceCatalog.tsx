"use client";

import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import ServiceCatalogCard from "./ServiceCatalogCard";

const ServiceCatalog = ({ onAddToCart, cartItems }: any) => {
  const [selectedQuantity, setSelectedQuantity] = useState<{
    [key: string]: number;
  }>({});

  const services = [
    {
      id: "1",
      name: "Premium Facial Package",
      type: "Facial Treatment",
      description: "Rejuvenating facial with advanced skincare techniques",
      regularPrice: 450,
      promotionalPrice: 349,
      sessions: 10,
      duration: "60 min/session",
      benefits: [
        "Anti-aging",
        "Hydration",
        "Skin brightening",
        "Vitamin infusion",
      ],
      image: "/premium-facial-treatment.jpg",
    },
    {
      id: "2",
      name: "Full Body Massage Bundle",
      type: "Massage Therapy",
      description: "Complete relaxation with therapeutic massage techniques",
      regularPrice: 380,
      sessions: 8,
      duration: "90 min/session",
      benefits: [
        "Stress relief",
        "Muscle relaxation",
        "Improved circulation",
        "Deep tissue work",
      ],
      image: "/full-body-massage.jpg",
    },
    {
      id: "3",
      name: "Spa Wellness Package",
      type: "Complete Wellness",
      description: "Comprehensive spa experience combining massage and facial",
      regularPrice: 599,
      promotionalPrice: 499,
      sessions: 12,
      duration: "120 min/session",
      benefits: [
        "Total relaxation",
        "Skin rejuvenation",
        "Stress management",
        "Wellness boost",
      ],
      image: "/spa-wellness.jpg",
    },
    {
      id: "4",
      name: "Hot Stone Massage Series",
      type: "Massage Therapy",
      description: "Therapeutic massage with heated stones for deep relaxation",
      regularPrice: 270,
      sessions: 6,
      duration: "75 min/session",
      benefits: [
        "Deep relaxation",
        "Muscle tension relief",
        "Improved blood flow",
      ],
      image: "/hot-stone-massage.jpg",
    },
    {
      id: "5",
      name: "Skincare Intensive",
      type: "Skincare Treatment",
      description:
        "Professional skincare consultation and intensive treatments",
      regularPrice: 299,
      promotionalPrice: 249,
      sessions: 5,
      duration: "45 min/session",
      benefits: [
        "Professional analysis",
        "Personalized care",
        "Skin health improvement",
      ],
      image: "/skincare-intensive.jpg",
    },
    {
      id: "6",
      name: "Aromatherapy Massage",
      type: "Massage Therapy",
      description: "Relaxing massage with essential oils and aromatherapy",
      regularPrice: 320,
      sessions: 6,
      duration: "60 min/session",
      benefits: [
        "Aromatherapy benefits",
        "Relaxation",
        "Stress reduction",
        "Mood enhancement",
      ],
      image: "/aromatherapy-massage.jpg",
    },
  ];

  const handleAddToCart = (service: Service) => {
    const quantity = selectedQuantity[service.id] || 1;
    onAddToCart(service, quantity);
    setSelectedQuantity((prev) => ({ ...prev, [service.id]: 1 }));
  };

  const getDiscount = (service: Service) => {
    if (!service.promotionalPrice) return null;
    const discount = Math.round(
      ((service.regularPrice - service.promotionalPrice) /
        service.regularPrice) *
        100
    );
    return discount;
  };

  const isInCart = (serviceId: string) =>
    cartItems.some((item) => item.id === serviceId);

  return (
    <div className="w-full flex flex-col h-[calc(100vh-200px)] overflow-">
      {/* Header - Fixed at top */}
      <div className="mb-8 flex-shrink-0">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Service Catalog
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse and add services to your cart
        </p>
      </div>

      {/* Scrollable Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 overflow-y-auto">
          {services.map((service) => (
            <ServiceCatalogCard

              key={service.id}
              service={service}
              discount={getDiscount}
              isInCart={isInCart}
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
              getDiscount={getDiscount}
              selectedQuantity={selectedQuantity}
              setSelectedQuantity={setSelectedQuantity}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalog;
