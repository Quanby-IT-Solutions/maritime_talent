"use client"

import { UseFormReturn } from "react-hook-form"
import { PersonalInformation } from "./PersonalInformation"
import { EventPreferences } from "./EventPreferences"
import { EmergencySafety } from "./EmergencySafety"
import { AdditionalInformation } from "./AdditionalInformation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, FileText, Shield, CheckCircle } from "lucide-react"
import { Icon } from "@iconify/react"

interface PerformerSectionProps {
  form: UseFormReturn<any>
  performerIndex: number
  performerNumber: number
}

export function PerformerSection({ form, performerIndex, performerNumber }: PerformerSectionProps) {
  // Get performer age to determine if parent/guardian signature is needed
  const performerAge = form.watch(`performers.${performerIndex}.age`)
  const needsParentSignature = performerAge && parseInt(performerAge) < 18

  const performerSections = [
    {
      id: `A${performerNumber}`,
      title: `Student Information`,
      stepNumber: 2,
      icon: "mdi:account",
      component: <PersonalInformation form={form} performerIndex={performerIndex} />,
      description: "Basic student details and contact information"
    },
    {
      id: `C${performerNumber}`,
      title: `Requirements`,
      stepNumber: 3,
      icon: "mdi:file-document",
      component: <EventPreferences form={form} performerIndex={performerIndex} />,
      description: "Upload required documents"
    },
    {
      id: `D${performerNumber}`,
      title: `Health & Fitness Declaration`,
      stepNumber: 4,
      icon: "mdi:shield-check",
      component: <EmergencySafety form={form} performerIndex={performerIndex} />,
      description: "Health declaration and fitness certification"
    },
    {
      id: `E${performerNumber}`,
      title: `Consent & Agreement`,
      stepNumber: 5,
      icon: "mdi:check-circle",
      component: <AdditionalInformation form={form} performerIndex={performerIndex} needsParentSignature={needsParentSignature} />,
      description: "Consent agreements and signatures"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Performer Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performer {performerNumber}</h2>
            {needsParentSignature && (
              <span className="inline-flex items-center gap-1 text-sm bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full font-medium mt-1">
                <Icon icon="mdi:alert" className="h-4 w-4" />
                Parent/Guardian signature required (Minor)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Performer Sections */}
      {performerSections.map((section, idx) => (
        <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{section.stepNumber}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {section.title} (Performer {performerNumber})
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{section.description}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {section.component}
          </div>
        </div>
      ))}
    </div>
  )
}