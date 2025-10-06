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

interface EmergencySafetyProps {
  form: UseFormReturn<any>
}

export function EmergencySafety({ form }: EmergencySafetyProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="emergencyContactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">1. Emergency Contact Person *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Full name of emergency contact"
                  className="text-base"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="emergencyContactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">2. Emergency Contact Number *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="+63 912 345 6789"
                  className="text-base"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="specialAssistance"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">3. Special Assistance Needed</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe any special assistance or accommodations needed..."
                className="min-h-[80px] resize-none text-base"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}