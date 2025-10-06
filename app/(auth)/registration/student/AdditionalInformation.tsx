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
import { Checkbox } from "@/components/ui/checkbox"

interface AdditionalInformationProps {
  form: UseFormReturn<any>
}

export function AdditionalInformation({ form }: AdditionalInformationProps) {
  const hearAboutOptions = [
    "Facebook/Social Media",
    "Website", 
    "Email Invitation",
    "Referred by Friend",
    "Participated Last Year",
    "Other"
  ]

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="hearAboutEvent"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">1. How did you hear about this event? *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {hearAboutOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("hearAboutEvent") === "Other" && (
        <FormField
          control={form.control}
          name="hearAboutOthers"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Please specify</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Please specify how you heard about the event"
                  className="text-base"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="space-y-4">
        <h4 className="text-base font-medium">2. Data Privacy Consent</h4>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Terms & Conditions:</strong> By registering for BEACON 2025, you agree to our data privacy policy and consent to the collection and processing of your personal information in accordance with the Data Privacy Act.
          </p>
        </div>

        <FormField
          control={form.control}
          name="dataPrivacyConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium leading-5">
                  I consent to the collection and processing of my personal data in accordance with the Data Privacy Act and agree to the Terms & Conditions. *
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormMessage />
      </div>
    </div>
  )
}