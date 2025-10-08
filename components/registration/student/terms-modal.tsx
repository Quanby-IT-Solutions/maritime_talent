"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Terms & Conditions - Maritime Talent Quest 2025
          </DialogTitle>
          <DialogDescription>
            Please read the following terms and conditions carefully before proceeding with your registration.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Information Declaration */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                1. Information Declaration & Accuracy
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  By registering for the Maritime Talent Quest 2025, you declare that all information provided in this registration form is true, accurate, and complete to the best of your knowledge.
                </p>
                <p>
                  You understand that providing false or misleading information may result in disqualification from the event and that you are responsible for updating any changes to your information prior to the event date.
                </p>
              </div>
            </section>

            {/* Rules & Regulations */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                2. Event Rules & Regulations
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  Participants agree to abide by all rules and regulations of the Maritime Talent Quest 2025, including but not limited to:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Performance time limits (maximum 5 minutes per act)</li>
                  <li>Appropriate content guidelines and standards</li>
                  <li>Safety protocols and emergency procedures</li>
                  <li>Event schedule and timing requirements</li>
                  <li>Conduct expectations during the event</li>
                  <li>Equipment and technical requirements</li>
                </ul>
                <p>
                  Non-compliance with event rules may result in disqualification or removal from the competition.
                </p>
              </div>
            </section>

            {/* Media & Publicity Consent */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                3. Media & Publicity Consent
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  You grant the Maritime Talent Quest 2025 organizers and Manila EGC Marine Supply Inc. the right to:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Photograph, record, and videotape your participation in the event</li>
                  <li>Use your name, school affiliation, and likeness for event documentation</li>
                  <li>Publish and distribute photos, videos, and recordings for promotional purposes</li>
                  <li>Use content on official websites, social media, and marketing materials</li>
                  <li>Share content with educational institutions and industry partners</li>
                </ul>
                <p>
                  This consent is granted without compensation and for the duration of the event and ongoing promotional activities.
                </p>
              </div>
            </section>

            {/* Health & Safety */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                4. Health & Safety Declaration
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  Participants declare that they are in good physical and mental health and are able to safely participate in their chosen performance category.
                </p>
                <p>
                  Any known medical conditions, allergies, or special requirements must be disclosed to event organizers prior to participation.
                </p>
              </div>
            </section>

            {/* Liability & Responsibility */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                5. Liability & Responsibility
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  Participants and their schools acknowledge that participation in the Maritime Talent Quest 2025 involves certain risks and agree to participate at their own responsibility.
                </p>
                <p>
                  The event organizers, venue, and sponsors shall not be liable for any injury, loss, or damage that may occur during participation in the event.
                </p>
              </div>
            </section>

            {/* School Endorsement */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                6. School Endorsement Requirements
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  All participants must have proper school endorsement confirming their enrollment status and authorization to participate in the event.
                </p>
                <p>
                  School officials providing endorsement must be authorized representatives of the educational institution.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                7. Contact & Updates
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  For questions regarding these terms and conditions or the Maritime Talent Quest 2025 event, please contact the event organizers.
                </p>
                <p>
                  Event details and requirements may be updated. Participants will be notified of any significant changes via the contact information provided in their registration.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}