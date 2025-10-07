"use client"

import { Card, CardContent } from "@/components/ui/card"

export function DraftManager() {
  return (
    <Card className="mb-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 dark:text-blue-300 text-xs font-bold">i</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-blue-900 dark:text-blue-100">
              BEACON 2025 Attendance Info:
            </span>
            <ul className="list-disc ml-4 space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>Sept 29 (Day 1)</li>
              <li>Sept 30 (Day 2)</li> 
              <li>Oct 1 (Day 3)</li>
            </ul>

            <span className="mt-4 font-semibold text-blue-900 dark:text-blue-100">
              BEACON 2025 events:
            </span>
            <ul className="list-disc ml-4 space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>EXPO</li>
              <li>CONFERENCE</li>
              <li>PHILIPPINE IN-WATER SHIP & BOAT SHOW</li>
              <li>BLUE RUNWAY</li>
              <li>NETWORKING & AWARDS NIGHT</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}