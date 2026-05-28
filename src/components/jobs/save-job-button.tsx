"use client"

import { useSavedJobs } from "@/hooks/useSavedJobs"

interface Props {
  jobId: string
  size?: "sm" | "md"
}

export function SaveJobButton({ jobId, size = "md" }: Props) {
  const { isSaved, toggleSave, isLoading } = useSavedJobs()
  const saved = isSaved(jobId)

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleSave(jobId)
      }}
      disabled={isLoading}
      title={saved ? "Remove from saved" : "Save job"}
      className={`transition-all hover:scale-110 active:scale-95 ${
        size === "sm" ? "p-1" : "p-1.5"
      } rounded-lg ${
        saved
          ? "text-amber-500 hover:text-amber-600"
          : "text-gray-300 hover:text-amber-400 dark:text-gray-600 dark:hover:text-amber-400"
      }`}
    >
      <svg
        className={size === "sm" ? "w-4 h-4" : "w-5 h-5"}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"
        />
      </svg>
    </button>
  )
}