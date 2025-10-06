"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

interface EventPreferencesProps {
  form: UseFormReturn<any>
}

export function EventPreferences({ form }: EventPreferencesProps) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const events = [
    { id: "networking", name: "NETWORKING & AWARDS NIGHT", color: "bg-purple-100 text-purple-800" },
    { id: "expo", name: "EXPO", color: "bg-blue-100 text-blue-800" },
    { id: "conference", name: "CONFERENCE", color: "bg-green-100 text-green-800" },
    { id: "ship-show", name: "PHILIPPINE IN-WATER SHIP & BOAT SHOW", color: "bg-orange-100 text-orange-800" },
    { id: "blue-runway", name: "BLUE RUNWAY", color: "bg-pink-100 text-pink-800" }
  ]

  const attendeeTypes = [
    "Student/Academic",
    "Government Official",
    "Industry Professional",
    "Maritime Professional",
    "General Public"
  ]

  const interestAreas = [
    "Maritime Technology",
    "Shipping & Logistics",
    "Maritime Law",
    "Marine Environment",
    "Port Management",
    "Marine Tourism",
    "Ocean Engineering",
    "Blue Economy",
    "Naval Architecture"
  ]

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Select Events to Attend */}
      <div>
        <h4 className="font-medium mb-4">1. Select Events to Attend *</h4>
        <p className="text-sm text-gray-600 mb-4">
          Select one or more events and <strong>then select specific dates</strong> for each selected event.
        </p>
        
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => handleEventToggle(event.id)}
                  />
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${event.color} mr-2`}>
                      SHOW
                    </span>
                    <span className="font-medium">{event.name}</span>
                  </div>
                </div>
              </div>
              
              {selectedEvents.includes(event.id) && (
                <div className="mt-3 ml-6 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium mb-2">Select dates for {event.name}:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center space-x-2">
                      <Checkbox />
                      <span className="text-sm">Sep 29 (Day 1)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox />
                      <span className="text-sm">Sep 30 (Day 2)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox />
                      <span className="text-sm">Oct 1 (Day 3)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Attendee Type */}
      <div>
        <h4 className="font-medium mb-4">2. Attendee Type *</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {attendeeTypes.map((type) => (
            <FormField
              key={type}
              control={form.control}
              name="attendeeType"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === type}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange(type)
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      {type}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>

      {/* Interest Areas */}
      <div>
        <h4 className="font-medium mb-4">3. Interest Areas *</h4>
        <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {interestAreas.map((area) => (
            <div key={area} className="flex items-center space-x-2">
              <Checkbox />
              <label className="text-sm">{area}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-start space-x-3">
          <Checkbox />
          <div className="space-y-1 leading-none">
            <label className="text-sm font-medium">
              4. Do you want to receive event updates?
            </label>
            <p className="text-xs text-gray-500">
              Get the latest news and updates about BEACON events
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox />
          <div className="space-y-1 leading-none">
            <label className="text-sm font-medium">
              5. Do you want to be invited to future events?
            </label>
            <p className="text-xs text-gray-500">
              Be the first to know about upcoming maritime events and conferences
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}