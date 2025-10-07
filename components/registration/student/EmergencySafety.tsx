"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Heart } from "lucide-react"

interface EmergencySafetyProps {
  form: UseFormReturn<any>
  performerIndex?: number
}

export function EmergencySafety({ form, performerIndex }: EmergencySafetyProps) {
  // Field name prefix for multi-performer support
  const fieldPrefix = performerIndex !== undefined ? `performers.${performerIndex}` : ""
  const getFieldName = (field: string) => performerIndex !== undefined ? `${fieldPrefix}.${field}` : field
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">D. Health & Fitness Declaration</h3>
        <p className="text-sm text-gray-600">Please confirm your health and fitness status for participation in the Maritime Talent Quest 2025.</p>
      </div>

      <Card className="border-2 border-blue-100 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
            <Heart className="h-5 w-5" />
            Health Declaration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                By checking the box below, I certify that:
              </p>
              <ul className="text-sm text-gray-700 space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  I am physically fit and in good health to participate in the Maritime Talent Quest 2025.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  There are no medical conditions or concerns that may hinder my ability to perform safely.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  I understand that I participate at my own risk and release the organizers from any liability.
                </li>
              </ul>
            </div>
          </div>

          <FormField
            control={form.control}
            name={getFieldName("healthDeclaration")}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium text-gray-900">
                    I certify that I am physically fit and in good health to participate in the Maritime Talent Quest 2025 *
                  </FormLabel>
                  <p className="text-xs text-gray-500">
                    This declaration is required for all participants
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-900">Important Safety Notice</h4>
            <div className="text-sm text-amber-800 mt-1 space-y-1">
              <p>• If you have any medical conditions, please consult with your physician before participating.</p>
              <p>• Participants under 18 years old must have parent/guardian consent.</p>
              <p>• Emergency medical personnel will be available during the event.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Signature Requirements</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <strong>Student Signature:</strong> Required upon form submission</p>
          <p>• <strong>Parent/Guardian Signature:</strong> Required if participant is below 18 years old</p>
          <p className="text-xs text-gray-500 mt-2">
            Digital signatures will be collected during the final submission process.
          </p>
        </div>
      </div>
    </div>
  )
}