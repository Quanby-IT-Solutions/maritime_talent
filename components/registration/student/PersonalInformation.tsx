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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PersonalInformationProps {
  form: UseFormReturn<any>
  performerIndex?: number
}

export function PersonalInformation({ form, performerIndex }: PersonalInformationProps) {
  const genderOptions = [
    "Male",
    "Female"
  ]

  // Field name prefix for multi-performer support
  const fieldPrefix = performerIndex !== undefined ? `performers.${performerIndex}` : ""
  const getFieldName = (field: string) => performerIndex !== undefined ? `${fieldPrefix}.${field}` : field

  return (
    <div className="space-y-6">
      {/* First row: First Name, Last Name, Middle Name, Suffix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name={getFieldName("fullName")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                1. First Name *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="First name" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={getFieldName("lastName")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                2. Last Name *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Last name" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={getFieldName("middleName")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                3. Middle Name
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Middle name (optional)" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={getFieldName("suffix")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                4. Suffix
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Jr., Sr., III, etc. (optional)" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Second row: Preferred Name, Nationality, Gender, Age */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name={getFieldName("preferredName")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                5. Preferred Name
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="How would you like to be called" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={getFieldName("nationality")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                6. Nationality *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Filipino, American, etc." 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={getFieldName("gender")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                7. Gender *
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genderOptions.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={getFieldName("age")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                8. Age *
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter your age" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Additional fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={getFieldName("school")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                School *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your school name" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={getFieldName("courseYear")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Course/Year Level *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., BS Marine Engineering - 3rd Year" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={getFieldName("contactNumber")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Number *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your contact number" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={getFieldName("email")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address *
              </FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="text-sm" 
                  {...field} 
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