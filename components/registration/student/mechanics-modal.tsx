"use client"

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
import { Trophy, Clock, Users, Star } from "lucide-react"

interface MechanicsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MechanicsModal({ open, onOpenChange }: MechanicsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Competition Mechanics - Maritime Talent Quest 2025
          </DialogTitle>
          <DialogDescription>
            Complete guide to the competition format, rules, and judging criteria.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Competition Overview */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="h-4 w-4" />
                1. Competition Overview
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  The Maritime Talent Quest 2025 is a performance competition celebrating the diverse talents of maritime students across the Philippines.
                </p>
                <p>
                  <strong>Event Date:</strong> October 23, 2025<br />
                  <strong>Venue:</strong> Manila EGC Marine Supply Inc.<br />
                  <strong>Format:</strong> Live performance competition with audience and panel judging
                </p>
              </div>
            </section>

            {/* Performance Categories */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                2. Performance Categories
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>Participants may compete in the following categories:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Singing:</strong> Solo or group vocal performances</li>
                  <li><strong>Dancing:</strong> Traditional, modern, or cultural dance performances</li>
                  <li><strong>Musical Instrument:</strong> Solo or ensemble instrumental pieces</li>
                  <li><strong>Spoken Word/Poetry:</strong> Original or interpretive spoken performances</li>
                  <li><strong>Theatrical/Drama:</strong> Short dramatic presentations or monologues</li>
                  <li><strong>Other:</strong> Unique talents not covered in standard categories</li>
                </ul>
              </div>
            </section>

            {/* Performance Rules */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4" />
                3. Performance Rules & Guidelines
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Time Limit:</strong> Maximum 5 minutes per performance</li>
                  <li><strong>Content:</strong> All performances must be appropriate for general audiences</li>
                  <li><strong>Language:</strong> Performances may be in English, Filipino, or local dialects</li>
                  <li><strong>Originality:</strong> Original compositions are encouraged but not required</li>
                  <li><strong>Props & Costumes:</strong> Simple props and costumes are allowed</li>
                  <li><strong>Sound System:</strong> Basic sound system and microphones will be provided</li>
                </ul>
              </div>
            </section>

            {/* Team Composition */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4" />
                4. Team Composition & Registration
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Solo Acts:</strong> Individual performers competing alone</li>
                  <li><strong>Group Acts:</strong> Teams of 2-10 performers maximum</li>
                  <li><strong>School Representation:</strong> All participants must be currently enrolled students</li>
                  <li><strong>Multiple Entries:</strong> Schools may submit multiple acts in different categories</li>
                  <li><strong>Registration Deadline:</strong> All registrations must be completed by the specified deadline</li>
                </ul>
              </div>
            </section>

            {/* Judging Criteria */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                5. Judging Criteria
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>Performances will be evaluated based on the following criteria:</p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2">
                  <ul className="space-y-1">
                    <li><strong>Technical Skill (30%):</strong> Proficiency and mastery of chosen talent</li>
                    <li><strong>Creativity & Originality (25%):</strong> Innovation and unique presentation</li>
                    <li><strong>Stage Presence (20%):</strong> Confidence, charisma, and audience engagement</li>
                    <li><strong>Overall Impact (15%):</strong> Memorable performance and emotional connection</li>
                    <li><strong>Time Management (10%):</strong> Effective use of allocated time</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Competition Format */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                6. Competition Format
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Preliminary Round:</strong> All registered acts perform (if applicable)</li>
                  <li><strong>Final Round:</strong> Top performers advance to final competition</li>
                  <li><strong>Performance Order:</strong> Determined by random draw on event day</li>
                  <li><strong>Sound Check:</strong> Brief technical rehearsal before competition begins</li>
                </ul>
              </div>
            </section>

            {/* Awards & Recognition */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                7. Awards & Recognition
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Overall Champion:</strong> Top performance across all categories</li>
                  <li><strong>Category Winners:</strong> First place in each performance category</li>
                  <li><strong>Special Awards:</strong> People's Choice, Most Creative, Best Newcomer</li>
                  <li><strong>Certificates:</strong> All participants receive certificates of participation</li>
                  <li><strong>Prizes:</strong> Winners receive trophies, certificates, and special prizes</li>
                </ul>
              </div>
            </section>

            {/* Event Day Schedule */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                8. Event Day Schedule (Tentative)
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <ul className="space-y-1">
                    <li><strong>8:00 AM - 9:00 AM:</strong> Registration and check-in</li>
                    <li><strong>9:00 AM - 10:00 AM:</strong> Opening ceremonies and orientation</li>
                    <li><strong>10:00 AM - 12:00 PM:</strong> Sound checks and technical rehearsals</li>
                    <li><strong>1:00 PM - 4:00 PM:</strong> Competition performances</li>
                    <li><strong>4:00 PM - 5:00 PM:</strong> Judging deliberation</li>
                    <li><strong>5:00 PM - 6:00 PM:</strong> Awards ceremony and closing</li>
                  </ul>
                  <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                    *Schedule may be adjusted based on number of participants
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900 dark:text-white">
                9. Questions & Contact
              </h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  For questions about competition mechanics, rules, or event details, please contact the organizing committee through the official event channels.
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