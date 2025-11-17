"use client";

import { Country, State, City } from "country-state-city";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpIcon, Pen, Trash } from "lucide-react";
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
import { useEffect, useState } from "react";

const CustomerForm = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

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

  return (
    <div className="newCustomerModal w-full">
      <div className="grid grid-cols-4 grid-row-1 w-full">
        <div className="modal-left flex flex-col items-center gap-4 col-span-1 p-4 px-2 bg-green-">
          <Avatar className="size-30!">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Submit"
              className="cursor-pointer"
            >
              <Trash />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Submit"
              className="cursor-pointer"
            >
              <Pen />
            </Button>
          </div>
        </div>

        <div className="modal-right col-span-3 p-4 bg-red- w-full">
          <div className="w-full ">
            <form>
              <FieldGroup>
                {/* Main details */}
                <FieldSet>
                  <FieldLegend>Main details</FieldLegend>

                  <FieldGroup>
                    {/* full name */}
                    <Field>
                      <FieldLabel htmlFor="checkout-7j9-full-name-43j">
                        Full name
                      </FieldLabel>
                      <Input
                        id="checkout-7j9-full-name-43j"
                        placeholder="Enter name"
                        required
                      />
                    </Field>

                    {/* phone */}
                    <Field>
                      <FieldLabel htmlFor="checkout-7j9-primary-phone-uw1">
                        Primary phone
                      </FieldLabel>
                      <Input
                        id="checkout-7j9-primary-phone-uw1"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </Field>

                    {/* Email */}
                    <Field>
                      <FieldLabel htmlFor="checkout-7j9-primary-email-uw1">
                        Primary email
                      </FieldLabel>
                      <Input
                        type="email"
                        id="checkout-7j9-primary-email-uw1"
                        placeholder="Enter email address"
                        required
                      />
                    </Field>

                    {/* Company */}
                    <Field>
                      <FieldLabel htmlFor="checkout-7j9-company-uw1">
                        Company
                      </FieldLabel>
                      <Input
                        type="text"
                        id="checkout-7j9-company-uw1"
                        placeholder="Enter company name"
                        required
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                {/* Address section  */}
                <FieldSet>
                  <FieldLegend>Address</FieldLegend>

                  {/* country/state/city selectors */}
                  <FieldGroup>
                    <div className="grid grid-cols-3 gap-4 w-full">
                      {/* Country */}
                      <Field>
                        <FieldLabel htmlFor="checkout-exp-country-ts6">
                          Country
                        </FieldLabel>

                        <Select
                          value={selectedCountry}
                          onValueChange={setSelectedCountry}
                        >
                          <SelectTrigger id="country">
                            <SelectValue placeholder="Select a country">
                              {/* {selectedCountry && (
                                  <span>
                                    {selectedCountry.flag}{" "}
                                    {selectedCountry.name}
                                  </span>
                                )} */}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country: any) => (
                              <SelectItem
                                key={country?.isoCode}
                                value={country?.isoCode}
                              >
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      {/* state */}
                      <Field>
                        <FieldLabel htmlFor="checkout-exp-state-ts6">
                          State
                        </FieldLabel>

                        <Select
                          value={selectedState}
                          onValueChange={setSelectedState}
                          disabled={!selectedCountry}
                        >
                          <SelectTrigger id="state">
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
                      </Field>

                      {/* city */}
                      <Field>
                        <FieldLabel htmlFor="checkout-exp-city-ts6">
                          City
                        </FieldLabel>

                        <Select
                          value={selectedCity}
                          onValueChange={setSelectedCity}
                          disabled={!selectedState}
                        >
                          <SelectTrigger id="city">
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
                      </Field>
                    </div>
                  </FieldGroup>

                  {/* Address */}
                  <Field>
                    <FieldLabel htmlFor="checkout-7j9-optional-address">
                      Address
                    </FieldLabel>
                    <Input
                      id="checkout-7j9-optional-address"
                      placeholder="Add any additional address"
                      className="resize-none"
                    />
                  </Field>
                </FieldSet>

                {/* submission/cancel button  */}
                <Field orientation="horizontal" className="flex justify-end">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button type="submit">Submit</Button>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
