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
    { value: "Singing", label: "Singing" },
    { value: "Dancing", label: "Dancing" },
    { value: "Musical Instrument", label: "Musical Instrument" },
    { value: "Spoken Word/Poetry", label: "Spoken Word/Poetry" },
    { value: "Theatrical/Drama", label: "Theatrical/Drama" },
    { value: "Other", label: "Other" }
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

        {watchPerformanceType === "Other" && (
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
                <Input placeholder="e.g., 3 minutes 30 seconds" className="text-base" {...field} />
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
                  {...field} 
                />
              </FormControl>
              <p className="text-sm text-gray-500">Enter a number between 1 and 10</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {watchNumberOfPerformers && parseInt(watchNumberOfPerformers) > 1 && (
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="groupMembers"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Names of Group Members</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please list the full names of all group members, one per line"
                    className="text-base min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <p className="text-sm text-gray-500">List each member's full name on a separate line</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}