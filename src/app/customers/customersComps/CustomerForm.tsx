"use client";

import { Country, State, City } from "country-state-city";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowUpIcon,
  Loader2,
  NotebookPen,
  Pen,
  Trash,
  Upload,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  City as CityInterface,
  CustomerFormProps,
  State as StateInterface,
} from "../Interfaces/customerInterfaces";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomerFormData, customerSchema } from "../schemas/CustomerSchema";
import { toast } from "sonner";

// console.log("=== CLOUDINARY CONFIG CHECK ===");
// console.log("Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
// console.log("Upload Preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
// console.log("===============================");

const CustomerForm = ({
  customer,
  onSubmit,
  open,
  onOpenChange,
}: CustomerFormProps) => {
  // country:  {emoji: '🇦🇫', id: 1, name: 'Afghanistan'}
  // state :  {id: 3871, name: 'Badghis'}
  // city :  {id: 72, name: 'Ghormach'}

  //  ✅ Detect mode
  const isEditMode = !!customer;
  console.log("📝 CustomerForm mode:", isEditMode ? "EDIT" : "CREATE");
  console.log(" + Customer", customer);

  // ✅ Dialog state - auto-open for edit mode
  const [dialogOpen, setDialogOpen] = useState(isEditMode);

  // // ✅ Dialog state, START With dialog closed
  // const [dialogOpen, setDialogOpen] = useState(isEditMode);

  // ✅ Avatar upload state
  const [avatarUrl, setAvatarUrl] = useState<string|null>(
    customer?.pictureURL || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string|null>(
    customer?.pictureURL || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // ✅ Store the file
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Location state
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [selectedCity, setSelectedCity] = useState("");

  // ✅ Location data
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<StateInterface[]>([]);
  const [cities, setCities] = useState<CityInterface[]>([]);

  const [imageDeleted, setImageDeleted] = useState(false);

  // console.log({ countries });
  // console.log({ states });
  // console.log({ cities });

  // ✅ Default form values function
  const getDefaultCustomerFormValues = useCallback(
    () => ({
      fullName: customer?.fullName || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      company: customer?.company || "",
      country: customer?.country || "",
      state: customer?.state || "",
      city: customer?.city || "",
      address: customer?.address || "",
      pictureURL: customer?.pictureURL || "",
    }),
    [customer]
  );

  // ✅ Auto-open dialog when customer prop changes (for edit mode)
  useEffect(() => {
    setAvatarPreview(customer?.pictureURL || "");
    if (customer) {
      console.log("✏️ Opening edit mode for:", customer.fullName);
      console.log("customer.pictureURL : ", customer.pictureURL);
      setDialogOpen(true);
    }
  }, [customer]);

  useEffect(() => {
    setAvatarPreview(customer?.pictureURL || "");
  }, []);

  // Load countries on mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries as any);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry);
      setStates(countryStates as any);
      setSelectedState(""); // Reset state
      setSelectedCity(""); // Reset city
      setCities([]); // Clear cities
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(stateCities as any);
      setSelectedCity(""); // Reset city
    }
  }, [selectedCountry, selectedState]);

  // ✅ Initialize form
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: getDefaultCustomerFormValues(),
    mode: "onBlur", // ✅ Only validate when field loses focus
    reValidateMode: "onBlur",
  });

  // ✅ Reset form when dialog opens
// ✅ NEW - Resets when dialog opens AND when customer changes
useEffect(() => {
  if (open) {
    console.log('🔄 Dialog opened, resetting to original data');
    
    // Reset form to original customer data
    form.reset(getDefaultCustomerFormValues());
    
    // Reset avatar preview to original
    setAvatarPreview(customer?.pictureURL || null);
    
    // Clear any selected file
    setSelectedFile(null);
    
    // Clear deletion flag
    setImageDeleted(false);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Reset location selects to original values
    setSelectedCountry(customer?.country || "");
    setSelectedState(customer?.state || "");
    setSelectedCity(customer?.city || "");
    
    console.log('✅ Form reset to original data');
  }
}, [open, customer, form, getDefaultCustomerFormValues]);

  // ✅ Form submission handler
  // const handleCustomerFormSubmit = useCallback(
  //   (data: CustomerFormData) => {
  //     console.log("🎉 FORM SUBMITTED!");
  //     console.log("Form Data:", data);

  //     try {
  //       // Get full names for display
  //       const countryName =
  //         countries.find((c) => c.isoCode === data.country)?.name ||
  //         data.country;
  //       const stateName =
  //         states.find((s) => s.isoCode === data.state)?.name || data.state;

  //       const customerData = {
  //         ...data,
  //         countryName,
  //         stateName,
  //         id: customer?.id || `customer-${Date.now()}`,
  //       };

  //       console.log("Customer Data to submit:", customerData);

  //       // Call the onSubmit prop
  //       onSubmit(customerData);

  //       // Show success message
  //       toast.success(
  //         customer
  //           ? "Customer updated successfully!"
  //           : "Customer added successfully!"
  //       );

  //       // ✅ Close dialog
  //       setDialogOpen(false);

  //       // Optional: Reset form after successful submission
  //       // form.reset(getDefaultCustomerFormValues());
  //     } catch (error) {
  //       console.error("Error submitting customer form:", error);
  //       toast.error("Failed to save customer. Please try again.");
  //     }
  //   },
  //   [countries, states, customer, onSubmit]
  // );

  // 🐛 DEBUG: Add error handler
  const handleFormError = (errors: any) => {
    console.log("❌ FORM VALIDATION FAILED!");
    console.log("Errors:", errors);
  };

  // ✅ Country change handler - memoized
  const handleCountryChange = useCallback(
    (value: string) => {
      console.log("Country isoCode selected:", value);

      const countryObj = countries.find((c: any) => c.isoCode === value);
      console.log({ countryObj });

      if (countryObj) {
        const countryData = {
          emoji: countryObj.flag,
          id: countries.indexOf(countryObj),
          name: countryObj.name,
          isoCode: countryObj.isoCode,
        };

        console.log("Country object:", countryData);
        setSelectedCountry(value);
      }
    },
    [countries]
  );

  // ✅ State change handler - memoized
  const handleStateChange = useCallback(
    (value: string) => {
      console.log("State isoCode selected:", value);

      const stateObj = states.find((s: any) => s.isoCode === value);
      console.log({ stateObj });

      if (stateObj) {
        const stateData = {
          id: states.indexOf(stateObj),
          name: stateObj.name,
        };

        console.log("State object:", stateData);
        setSelectedState(value);
      }
    },
    [states]
  );

  // ✅ City change handler - memoized
  const handleCityChange = useCallback(
    (value: string) => {
      console.log("City Name selected:", value);

      const cityObj = cities.find((c: any) => c.name === value);
      console.log({ cityObj });

      if (cityObj) {
        const cityData = {
          id: cities.indexOf(cityObj),
          name: cityObj.name,
        };

        console.log("City object:", cityData);
        setSelectedCity(value);
      }
    },
    [cities]
  );

  // ✅ Upload to Cloudinary (called ONLY on submit)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    console.log("🚀 Uploading to Cloudinary:", file.name);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    console.log({ cloudName: cloudName, uploadPreset: uploadPreset });

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration missing. Check .env.local");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "customer-avatars");

    try {
      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Upload failed:", error);
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();
      console.log("✅ Upload successful:");
      console.log("  URL:", data.secure_url);
      console.log("  Format:", data.format);
      console.log("  Size:", data.width, "x", data.height);

      return data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // ✅ Handle file selection and upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log({ "event.target.files?.[0] ": event.target.files?.[0] });
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("📁 File selected:", file.name);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // ✅ Store the file for later upload
    setSelectedFile(file);
    setImageDeleted(false); // ✅ Clear deletion flag

    // ✅ Create local preview URL (instant!)
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    console.log("✅ Preview created (not uploaded yet)");
    toast.success("Image selected! It will upload when you submit.");
  };

  // ✅ Delete avatar
  const handleDeleteAvatar = useCallback(() => {
    console.log("🗑️ Deleting avatar");

    setAvatarPreview("");
    setSelectedFile(null);
    setImageDeleted(true); // ✅ Track deletion

    form.setValue("pictureURL", "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Avatar removed");
  }, [form]);

  // ✅ Form submission handler
  const handleCustomerFormSubmit = useCallback(
    async (data: CustomerFormData) => {
      console.log("🎉 FORM SUBMITTED!");
      console.log(isEditMode ? "✏️ EDITING" : "➕ CREATING", "customer");

      try {
        setIsUploading(true);

        // ✅ CRITICAL FIX: Keep existing picture URL by default
        let finalPictureURL = customer?.pictureURL || null;

        // ✅ Check if image was explicitly deleted
        if (imageDeleted) {
          console.log("🗑️ Image was deleted, setting to null");
          finalPictureURL = null;
        }
        // ✅ Check if new image was selected
        else if (selectedFile) {
          console.log("📤 New image selected, uploading...");
          toast.info("Uploading image...");

          try {
            finalPictureURL = await uploadToCloudinary(selectedFile);
            console.log("✅ New image uploaded:", finalPictureURL);
          } catch (uploadError) {
            console.error("❌ Upload failed:", uploadError);
            toast.error("Failed to upload image");
            setIsUploading(false);
            return;
          }
        }
        // ✅ Otherwise keep existing image
        else {
          console.log("ℹ️ No changes to image, keeping:", finalPictureURL);
        }

        // ✅ Prepare data
        const customerData = {
          fullName: data.fullName,
          email: data.email || null,
          phone: data.phone || null,
          company: data.company || null,
          country: data.country || null,
          state: data.state || null,
          city: data.city || null,
          address: data.address || null,
          pictureURL: finalPictureURL,
        };

        console.log("📤 Submitting customer data:", customerData);

        // ✅ Call parent's onSubmit (handleCreateCustomer)
        await onSubmit(customerData);

        onOpenChange(false);
        // ✅ SUCCESS: Close dialog
        console.log("✅ Submission successful, closing dialog");

        setSelectedCountry("");
        setSelectedState("");
        setSelectedCity("");
        form.reset();
        setAvatarPreview("");
        setSelectedFile(null);
      } catch (error) {
        // ✅ ERROR: Keep dialog open, user can retry
        // Error toast already shown in parent
        console.error("Submission failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [
      customer,
      selectedFile,
      imageDeleted,
      onSubmit,
      form,
      isEditMode,
      onOpenChange,
    ]
  );

  console.log({ customer });
  console.log({ avatarPreview });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="thisDialog flex flex-col justify-between gap-10 sm:max-w-[850px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log({ e });
              console.log("🚀 Form submit event triggered");
              e.preventDefault();
              form.handleSubmit(handleCustomerFormSubmit, handleFormError)(e);
            }}
          >
            <DialogHeader className="flex mb-4">
              <DialogTitle>
                {!isEditMode ? "Add New Customer" : "Edit Customer"}
              </DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-4 grid-row-1 w-full mb-4">
              <div className="modal-left flex flex-col items-center gap-4 col-span-1 p-4 px-2">
                <Avatar className="size-30 object-contain">
                  <AvatarImage
                    src={avatarPreview || undefined}
                    alt={customer?.fullName || "Customer"}
                  />
                  <AvatarFallback>
                    {" "}
                    {customer?.fullName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                {/* Show indicator if new file selected */}
                {selectedFile && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    New
                  </div>
                )}
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Delete Avatar"
                    className="cursor-pointer"
                    onClick={handleDeleteAvatar}
                    disabled={!avatarPreview || isUploading}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                  {/* Upload Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Upload Avatar"
                    className="cursor-pointer"
                    onClick={() => {
                      fileInputRef.current?.click();
                      console.log({ fileInputRef });
                    }}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {/* Info text */}
                {selectedFile && (
                  <p className="text-xs text-muted-foreground text-center">
                    Image will upload when you submit
                  </p>
                )}
              </div>

              <div className="modal-right col-span-3 p-4 w-full">
                <FieldGroup>
                  {/* Main details */}
                  <FieldSet>
                    <FieldLegend>Main details</FieldLegend>

                    <FieldGroup>
                      {/* full name */}
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className="flex items-center gap-2"
                              htmlFor="checkout-7j9-full-name-43j"
                            >
                              Full name *
                            </FormLabel>
                            <FormControl className="mt-2">
                              <Input
                                id="checkout-7j9-full-name-43j"
                                placeholder="Enter full name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* phone */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className="flex items-center gap-2"
                              htmlFor="checkout-7j9-primary-phone-uw1"
                            >
                              Primary phone *
                            </FormLabel>
                            <FormControl className="mt-2">
                              <Input
                                id="checkout-7j9-primary-phone-uw1"
                                placeholder="1234 5678 9012 3456"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className="flex items-center gap-2"
                              htmlFor="checkout-7j9-primary-email-uw1"
                            >
                              Primary email
                            </FormLabel>
                            <FormControl className="mt-2">
                              <Input
                                type="email"
                                id="checkout-7j9-primary-email-uw1"
                                placeholder="Enter email address"
                                {...field}
                              />
                            </FormControl>
                            {/* <FormMessage /> */}
                          </FormItem>
                        )}
                      />

                      {/* Company */}
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className="flex items-center gap-2"
                              htmlFor="checkout-7j9-company-uw1"
                            >
                              Company
                            </FormLabel>
                            <FormControl className="mt-2">
                              <Input
                                type="text"
                                id="checkout-7j9-company-uw1"
                                placeholder="Enter company name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </FieldGroup>
                  </FieldSet>

                  {/* Address section  */}
                  <FieldSet>
                    <FieldLegend>Address</FieldLegend>

                    {/* country/state/city selectors */}
                    <FieldGroup>
                      <div className="grid grid-cols-3 gap-4 w-full">
                        {/* Country */}
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className="flex items-center gap-2"
                                htmlFor="checkout-exp-country-ts6"
                              >
                                Country
                              </FormLabel>
                              <FormControl className="mt-2">
                                <Select
                                  value={selectedCountry}
                                  onValueChange={(value) => {
                                    handleCountryChange(value);
                                    field.onChange(value);
                                  }}
                                >
                                  <SelectTrigger id="checkout-exp-country-ts6">
                                    <SelectValue placeholder="Select a country"></SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {countries.map((country: any) => (
                                      <SelectItem
                                        key={country.isoCode}
                                        value={country.isoCode}
                                      >
                                        {country.flag} {country.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* state */}
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className="flex items-center gap-2"
                                htmlFor="checkout-exp-state-ts6"
                              >
                                State
                              </FormLabel>
                              <FormControl className="mt-2">
                                <Select
                                  value={selectedState}
                                  onValueChange={(value) => {
                                    handleStateChange(value);
                                    field.onChange(value);
                                  }}
                                  disabled={!selectedCountry}
                                >
                                  <SelectTrigger id="checkout-exp-state-ts6">
                                    <SelectValue placeholder="Select a state" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {states.length > 0 ? (
                                      states.map((state) => (
                                        <SelectItem
                                          key={state.isoCode}
                                          value={state.isoCode}
                                        >
                                          {state.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="none" disabled>
                                        No states available
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* city */}
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                className="flex items-center gap-2"
                                htmlFor="checkout-exp-city-ts6"
                              >
                                City
                              </FormLabel>
                              <FormControl className="mt-2">
                                <Select
                                  value={selectedCity}
                                  onValueChange={(value) => {
                                    handleCityChange(value);
                                    field.onChange(value);
                                  }}
                                  disabled={!selectedState}
                                >
                                  <SelectTrigger id="checkout-exp-city-ts6">
                                    <SelectValue placeholder="Select a city" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {cities.length > 0 ? (
                                      cities.map((city, index) => (
                                        <SelectItem
                                          key={`${city.name}-${index}`}
                                          value={city.name}
                                        >
                                          {city.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="none" disabled>
                                        No cities available
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </FieldGroup>

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className="flex items-center gap-2"
                            htmlFor="checkout-7j9-address-uw1"
                          >
                            Address
                          </FormLabel>
                          <FormControl className="mt-2">
                            <Input
                              type="text"
                              id="checkout-7j9-address-uw1"
                              placeholder="Street address, apartment, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FieldSet>
                </FieldGroup>
              </div>
            </div>

            {/* submission/cancel button  */}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="cursor-pointer"
                type="submit"
                // onClick={() => console.log("Submit button clicked")}
              >
                {!isEditMode ? "Add Customer" : "Update Customer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerForm;
