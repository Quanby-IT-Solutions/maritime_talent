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
}

export function PersonalInformation({ form }: PersonalInformationProps) {
  const genderOptions = [
    "Male",
    "Female", 
    "Non-binary",
    "Prefer not to say"
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-base">1. Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" className="text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">2. Age *</FormLabel>
              <FormControl>
                <Input type="number" placeholder="25" className="text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">3. Gender *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
          name="ageBracket"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">4. Age Bracket *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age bracket" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="16-18">16-18</SelectItem>
                  <SelectItem value="19-21">19-21</SelectItem>
                  <SelectItem value="22-25">22-25</SelectItem>
                  <SelectItem value="26-30">26-30</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">5. School *</FormLabel>
              <FormControl>
                <Input placeholder="Enter your school name" className="text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="courseYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">6. Course/Year Level *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., BS Marine Engineering - 3rd Year" className="text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Photo Capture Section */}
      <div className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No photo taken</span>
          </div>
          <h4 className="font-medium mb-2">8. Photo Capture *</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please capture a clear photo of yourself for identification purposes.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Take Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}