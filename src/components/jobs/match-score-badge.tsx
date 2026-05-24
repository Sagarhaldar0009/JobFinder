"use client"

import { useState } from "react"

interface MatchResult {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  matchedKeywords: string[]
  level: "excellent" | "good" | "fair" | "low"
  summary: string
}

interface Props {
  result: MatchResult
}

const LEVEL_STYLES = {
  excellent: {
    ring:    "ring-2 ring-green-400",
    badge:   "bg-green-500 text-white",
    bar:     "bg-green-500",
    text:    "text-green-700",
    bg:      "bg-green-50 border-green-200",
    label:   "Excellent Match",
    emoji:   "🎯",
  },
  good: {
    ring:    "ring-2 ring-blue-400",
    badge:   "bg-blue-500 text-white",
    bar:     "bg-blue-500",
    text:    "text-blue-700",
    bg:      "bg-blue-50 border-blue-200",
    label:   "Good Match",
    emoji:   "👍",
  },
  fair: {
    ring:    "ring-2 ring-amber-400",
    badge:   "bg-amber-400 text-white",
    bar:     "bg-amber-400",
    text:    "text-amber-700",
    bg:      "bg-amber-50 border-amber-200",
    label:   "Fair Match",
    emoji:   "🤔",
  },
  low: {
    ring:    "ring-1 ring-gray-200",
    badge:   "bg-gray-400 text-white",
    bar:     "bg-gray-400",
    text:    "text-gray-500",
    bg:      "bg-gray-50 border-gray-200",
    label:   "Low Match",
    emoji:   "📉",
  },
}

export function MatchScoreBadge({ result }: Props) {
  const [showDetails, setShowDetails] = useState(false)
  const style = LEVEL_STYLES[result.level]

  return (
    <div className="relative">
      {/* Score Pill */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
          transition-all hover:scale-105 ${style.badge}`}
        title="Click to see match details"
      >
        <span>{style.emoji}</span>
        <span>{result.score}% Match</span>
      </button>

      {/* Details Popover */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDetails(false)}
          />

          {/* Popover */}
          <div className={`absolute right-0 top-8 z-20 w-72 border rounded-xl p-4
            shadow-xl bg-white flex flex-col gap-3 ${style.ring}`}>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{style.emoji}</span>
                <div>
                  <p className={`text-sm font-bold ${style.text}`}>
                    {style.label}
                  </p>
                  <p className="text-xs text-gray-400">{result.score}% compatibility</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-300 hover:text-gray-500 text-lg"
              >
                ×
              </button>
            </div>

            {/* Score Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Match Score</span>
                <span className={`font-bold ${style.text}`}>{result.score}/100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${style.bar}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            {/* Summary */}
            <p className={`text-xs rounded-lg px-3 py-2 border ${style.bg} ${style.text}`}>
              {result.summary}
            </p>

            {/* Matched Skills */}
            {result.matchedSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-700 mb-1.5 flex items-center gap-1">
                  ✅ Matched Skills ({result.matchedSkills.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.matchedSkills.slice(0, 6).map((skill) => (
                    <span key={skill}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium capitalize">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missingSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-500 mb-1.5 flex items-center gap-1">
                  ❌ Gap Skills ({result.missingSkills.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.missingSkills.slice(0, 5).map((skill) => (
                    <span key={skill}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium capitalize">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Upgrade Hint */}
            <div className="border-t pt-2 mt-1">
              <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                💎 Pro: AI-powered scoring available
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                📁 src/components/jobs/ai-match-score.tsx
              </p>
              <p className="text-[10px] text-gray-400">
                📁 src/app/api/jobs/match/ai/route.ts
              </p>
              <p className="text-[10px] text-gray-400">
                Task: Send resume + JD to Claude Haiku →
                get detailed score + reasoning + action plan
              </p>
            </div>

          </div>
        </>
      )}
    </div>
  )
}