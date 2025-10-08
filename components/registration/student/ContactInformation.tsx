"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ContactInformationProps {
  form: UseFormReturn<any>
}

export function ContactInformation({ form }: ContactInformationProps) {
  const performanceTypes = [
    { value: "singing", label: "Singing" },
    { value: "dancing", label: "Dancing" },
    { value: "musical-instrument", label: "Musical Instrument" },
    { value: "spoken-word", label: "Spoken Word/Poetry" },
    { value: "theatrical", label: "Theatrical/Drama" },
    { value: "other", label: "Other" }
  ]

  const watchPerformanceType = form.watch("performanceType")
  const watchNumberOfPerformers = form.watch("numberOfPerformers")

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> After completing this section, additional forms will appear based on the number of performers you specify.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="performanceType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-medium">Type of Performance *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {performanceTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label htmlFor={type.value} className="text-sm font-normal">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchPerformanceType === "other" && (
          <FormField
            control={form.control}
            name="performanceOther"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Please specify other performance type *</FormLabel>
                <FormControl>
                  <Input placeholder="Please specify your performance type" className="text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={form.control}
          name="performanceTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Title of Piece/Performance *</FormLabel>
              <FormControl>
                <Input placeholder="Enter the title of your performance" className="text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="performanceDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Duration (max 5 mins) *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  max="5"
                  placeholder="Enter duration in minutes (1-5)" 
                  className="text-base" 
                  onKeyPress={(e) => {
                    // Prevent non-numeric characters
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers 1-5
                    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 5)) {
                      field.onChange(value);
                    }
                  }}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numberOfPerformers"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Number of Performers (1-10) *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  max="10"
                  placeholder="Enter number of performers (1-10)" 
                  className="text-base" 
                  onKeyPress={(e) => {
                    // Prevent non-numeric characters
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers 1-10
                    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 10)) {
                      field.onChange(value);
                    }
                  }}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}