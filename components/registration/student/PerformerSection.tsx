"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { PersonalInformation } from "./PersonalInformation"
import { EventPreferences } from "./EventPreferences"
import { EmergencySafety } from "./EmergencySafety"
import { AdditionalInformation } from "./AdditionalInformation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, ChevronDown } from "lucide-react"
import { Icon } from "@iconify/react"

interface PerformerSectionProps {
  form: UseFormReturn<any>
  performerIndex: number
  performerNumber: number
}

export function PerformerSection({ form, performerIndex, performerNumber }: PerformerSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
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
    <div>
      {/* Collapsible Performer Card */}
      <Card 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 animate-fade-in-scale"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Header - Always Visible and Fully Clickable */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performer {performerNumber}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isExpanded ? 'Click to collapse' : 'Click to expand'} • 4 sections
                  </span>
                  {needsParentSignature && (
                    <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full font-medium">
                      <Icon icon="mdi:alert" className="h-3 w-3" />
                      Minor
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 ml-3">
              <div className={`transition-transform duration-200 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded 
            ? 'opacity-100 border-t border-gray-200 dark:border-gray-700'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div>
            <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50" onClick={(e) => e.stopPropagation()}>
              {/* Performer Sections */}
              {performerSections.map((section, idx) => (
                <div 
                  key={section.id} 
                  className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm ${
                    isExpanded ? 'animate-fade-in-scale' : ''
                  }`}
                  style={{
                    animationDelay: isExpanded ? `${idx * 100}ms` : '0ms',
                    animationFillMode: 'both'
                  }}
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{section.stepNumber}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{section.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-800">
                    {section.component}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}