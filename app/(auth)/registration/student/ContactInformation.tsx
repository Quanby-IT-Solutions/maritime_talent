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

interface ContactInformationProps {
  form: UseFormReturn<any>
}

export function ContactInformation({ form }: ContactInformationProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">1. Email Address *</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="your.email@example.com" 
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
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">2. Phone *</FormLabel>
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
        name="landline"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">3. Landline (Optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter landline number" 
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
        name="mailingAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">4. Mailing Address (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter your complete mailing address..."
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