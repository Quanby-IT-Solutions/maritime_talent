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
      title: `A${performerNumber}. Student Information (Performer ${performerNumber})`,
      icon: "mdi:account",
      borderColor: "border-blue-100",
      bgColor: "bg-blue-50/30",
      titleColor: "text-blue-900",
      descColor: "text-blue-700",
      component: <PersonalInformation form={form} performerIndex={performerIndex} />,
      description: "Basic student details and contact information"
    },
    {
      id: `C${performerNumber}`,
      title: `C${performerNumber}. Requirements (Performer ${performerNumber})`,
      icon: "mdi:file-document",
      borderColor: "border-green-100",
      bgColor: "bg-green-50/30",
      titleColor: "text-green-900",
      descColor: "text-green-700",
      component: <EventPreferences form={form} performerIndex={performerIndex} />,
      description: "Upload required documents"
    },
    {
      id: `D${performerNumber}`,
      title: `D${performerNumber}. Health & Fitness Declaration (Performer ${performerNumber})`,
      icon: "mdi:shield-check",
      borderColor: "border-amber-100",
      bgColor: "bg-amber-50/30",
      titleColor: "text-amber-900",
      descColor: "text-amber-700",
      component: <EmergencySafety form={form} performerIndex={performerIndex} />,
      description: "Health declaration and fitness certification"
    },
    {
      id: `E${performerNumber}`,
      title: `E${performerNumber}. Consent & Agreement (Performer ${performerNumber})`,
      icon: "mdi:check-circle",
      borderColor: "border-purple-100",
      bgColor: "bg-purple-50/30",
      titleColor: "text-purple-900",
      descColor: "text-purple-700",
      component: <AdditionalInformation form={form} performerIndex={performerIndex} needsParentSignature={needsParentSignature} />,
      description: "Consent agreements and signatures"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Performer Header */}
      <Card className={`border-2 border-slate-200 bg-slate-50/30`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
            <User className="h-6 w-6" />
            Performer {performerNumber}
            {needsParentSignature && (
              <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                Minor - Parent/Guardian signature required
              </span>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Performer Sections */}
      {performerSections.map((section, idx) => (
        <div key={section.id} className="space-y-4">
          <Card className={`border-2 ${section.borderColor} ${section.bgColor}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 text-lg ${section.titleColor}`}>
                <Icon icon={section.icon} className="h-5 w-5" />
                {section.title}
              </CardTitle>
              <p className={`text-sm ${section.descColor}`}>{section.description}</p>
            </CardHeader>
            <CardContent>
              {section.component}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}