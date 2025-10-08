"use client"

import { UseFormReturn } from "react-hook-form"
import { useState, useEffect } from "react"
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

  const handlePhoneChange = (value: string, onChange: (value: string) => void) => {
    // Remove all non-digits
    let cleanValue = value.replace(/\D/g, '');
    
    // If it starts with 63, keep it
    // If it starts with 0, replace with 63
    // If it's empty or starts with something else, prepend 63
    if (cleanValue.startsWith('63')) {
      // Keep as is, but limit to 12 digits total (63 + 10 digits)
      cleanValue = cleanValue.substring(0, 12);
    } else if (cleanValue.startsWith('0')) {
      // Replace leading 0 with 63
      cleanValue = '63' + cleanValue.substring(1);
      cleanValue = cleanValue.substring(0, 12);
    } else if (cleanValue.length > 0) {
      // Prepend 63 to any other number
      cleanValue = '63' + cleanValue;
      cleanValue = cleanValue.substring(0, 12);
    } else {
      // Empty input, just set 63
      cleanValue = '63';
    }
    
    // Format the number: +63 XXX XXX XXXX
    let formattedValue = '+63';
    if (cleanValue.length > 2) {
      const remaining = cleanValue.substring(2);
      if (remaining.length <= 3) {
        formattedValue += ' ' + remaining;
      } else if (remaining.length <= 6) {
        formattedValue += ' ' + remaining.substring(0, 3) + ' ' + remaining.substring(3);
      } else {
        formattedValue += ' ' + remaining.substring(0, 3) + ' ' + remaining.substring(3, 6) + ' ' + remaining.substring(6);
      }
    }
    
    onChange(formattedValue);
  };

  // Initialize contact number with +63 if empty
  useEffect(() => {
    const currentValue = form.getValues(getFieldName("contactNumber"));
    if (!currentValue || currentValue === "") {
      form.setValue(getFieldName("contactNumber"), "+63");
    }
  }, [form, getFieldName]);

  return (
    <div className="space-y-6">
      {/* First row: Full Name */}
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name={getFieldName("fullName")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name *
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your full name" 
                  className="text-sm" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Second row: Age and Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={getFieldName("age")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Age *
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
        
        <FormField
          control={form.control}
          name={getFieldName("gender")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender *
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
      </div>

      {/* Third row: School */}
      <div className="grid grid-cols-1 gap-4">
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
      </div>

      {/* Fourth row: Course/Year Level */}
      <div className="grid grid-cols-1 gap-4">
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

      {/* Fifth row: Contact Number and Email */}
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
                  placeholder="+63 XXX XXX XXXX" 
                  className="text-sm" 
                  value={field.value || '+63'}
                  onChange={(e) => handlePhoneChange(e.target.value, field.onChange)}
                  onKeyPress={(e) => {
                    // Allow only numbers, backspace, delete, tab, enter, and space
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', ' '].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
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