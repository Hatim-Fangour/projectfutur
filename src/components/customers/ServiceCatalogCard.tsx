import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ShoppingCart, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ServiceCatalogCard = ({
  service,
  cartItems,
  getDiscount,
  isInCart,
  onAddToCart,
  selectedQuantity,
  setSelectedQuantity,
}: any) => {
  const discount = getDiscount(service);
  const inCart = isInCart(service.id);
  const cartQuantity =
    cartItems.find((item) => item.id === service.id)?.quantity || 1;

  return (
    <Card
      key={service.id}
      className="border gap-2   transition-all hover:shadow-md dark:hover:bg-neutral-800  cursor-pointer group py-0 overflow-hidden group flex flex-col"
    >
      {/* Image */}
      <div className="relative h-68 bg-muted/30 overflow-hidden">
        <img
          src={service.image || "/placeholder.svg"}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span className="text-sm font-bold">{discount}% OFF</span>
          </div>
        )}

        <div className="absolute top-3 left-1  text-white px-3 py-1 rounded-full flex items-start flex-col gap-1">
          <Badge className="bg-neutral-600 text-white px-3 py-1 rounded-full text-md">
            {service.name}
          </Badge>
          <Badge className="bg-neutral-600 text-white px-3 py-1 rounded-full text-xsm">
            {service.type}
          </Badge>
        </div>
        <div className="w-full absolute bottom-0 left-0 px-3 py-3 flex items-start flex-col gap-1 bg-gradient-to-b from-0%  to-neutral-800 from-neutral-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-sm text-white line-clamp-2">
            {service.description}
          </p>
        </div>
      </div>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4">
        {/* Pricing */}
        <div className="space-y-1">
          {service.promotionalPrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-">
                ${service.promotionalPrice}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ${service.regularPrice}
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-">
              ${service.regularPrice}
            </span>
          )}
          <p className="text-xs text-muted-foreground">
            {service.sessions} sessions included
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/30 rounded-lg p-2 border">
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium text-foreground">{service.duration}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 border">
            <p className="text-muted-foreground">Sessions</p>
            <p className="font-medium text-foreground">{service.sessions}</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap gap-1">
          {service.benefits.slice(0, 3).map((benefit, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs border-neutral-700 border-1!"
            >
              {benefit}
            </Badge>
          ))}
          {service.benefits.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{service.benefits.length - 3}
            </Badge>
          )}
        </div>

        {/* Quantity & Add to Cart */}
        <div className="space-y-4 mt-auto pt-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor={`qty-${service.id}`}
              className="text-xs text-muted-foreground"
            >
              Quantity:
            </label>

            <Select defaultValue="1">
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[1, 2, 3, 4, 5].map((qty) => (
                    <SelectItem key={qty} value={qty.toString()}>
                      {qty}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* <select
              id={`qty-${service.id}`}
              value={selectedQuantity[service.id] || 1}
              onChange={(e) =>
                setSelectedQuantity((prev) => ({
                  ...prev,
                  [service.id]: Number.parseInt(e.target.value),
                }))
              }
              className="flex-1 px-2 py-1 rounded border border-border bg-background text-sm"
            >
              {[1, 2, 3, 4, 5].map((qty) => (
                <option key={qty} value={qty}>
                  {qty}
                </option>
              ))}
            </select> */}
          </div>
          <Button
            onClick={() => onAddToCart(service)}
            className="w-full gap-2 bg-accent hover:bg-accent/90 text-white border"
            variant={inCart ? "outline" : "default"}
          >
            <ShoppingCart className="w-4 h-4" />
            {inCart ? `In Cart (${cartQuantity})` : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCatalogCard;
