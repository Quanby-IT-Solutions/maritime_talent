"use client"

export function DraftManager() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-bold">ℹ</span>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block mb-2">
              BEACON 2025 Attendance Info:
            </span>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                Sept 29 (Day 1)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                Sept 30 (Day 2)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                Oct 1 (Day 3)
              </li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-gray-900 dark:text-white block mb-2">
              BEACON 2025 events:
            </span>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                EXPO
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                CONFERENCE
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                PHILIPPINE IN-WATER SHIP & BOAT SHOW
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                BLUE RUNWAY
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                NETWORKING & AWARDS NIGHT
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}