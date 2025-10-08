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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, School } from "lucide-react"

interface SchoolEndorsementProps {
  form: UseFormReturn<any>
}

export function SchoolEndorsement({ form }: SchoolEndorsementProps) {
  return (
    <Card className="border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
          <School className="h-5 w-5" />
          F. For School Endorsement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 mb-4">
            <strong>For School Officials:</strong> We hereby certify that the above student(s) is/are currently enrolled in our institution and is/are endorsed to participate in the Maritime Talent Quest 2025.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="schoolOfficialName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Name of School Official</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter name of school official"
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
              name="schoolOfficialPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Position</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter position/title"
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950/30 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">School Endorsement Requirements</h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                <p>• Official signature and school seal required</p>
                <p>• Date of endorsement must be provided</p>
                <p>• School official must be authorized to endorse students</p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                  Physical signatures and school seal can be submitted separately or during event registration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}