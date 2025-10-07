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
    <Card className="border-2 border-purple-100 bg-purple-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
          <School className="h-5 w-5" />
          F. For School Endorsement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white rounded-lg p-4 border border-purple-200">
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

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-purple-900">School Endorsement Requirements</h4>
              <div className="text-sm text-purple-800 mt-1 space-y-1">
                <p>• Official signature and school seal required</p>
                <p>• Date of endorsement must be provided</p>
                <p>• School official must be authorized to endorse students</p>
                <p className="text-xs text-purple-600 mt-2">
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