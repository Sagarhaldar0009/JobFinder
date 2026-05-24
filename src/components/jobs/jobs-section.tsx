"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { FreeJobBoard } from "./free-job-board"

export function JobsSection() {
  const [mode, setMode] = useState<"free" | "paid">("free")

  return (
    <div className="flex flex-col gap-6">

      {/* Toggle */}
      <div className="flex items-center gap-2 bg-white border rounded-xl p-1.5 w-fit shadow-sm">
        <button
          onClick={() => setMode("free")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "free"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Free Sources
        </button>
        <button
          onClick={() => setMode("paid")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            mode === "paid"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Premium Sources
          <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
            Pro
          </Badge>
        </button>
      </div>

      {mode === "free" ? (
        <FreeJobBoard />
      ) : (
        <PaidPlaceholder onSwitch={() => setMode("free")} />
      )}
    </div>
  )
}

function PaidPlaceholder({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div className="border-2 border-dashed border-amber-300 rounded-2xl bg-amber-50 p-10 flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl">
        💎
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Premium Job Sources
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          User Story 06 — Option 2 (Paid Version)
        </p>
      </div>

      <div className="bg-white border border-amber-200 rounded-xl p-5 max-w-lg w-full text-left flex flex-col gap-3">
        <p className="text-amber-800 font-semibold text-sm">🚧 Work in Progress</p>
        <p className="text-gray-600 text-sm">
          Uses <strong>JSearch on RapidAPI</strong> ($10/mo) to pull jobs from
          Indeed, LinkedIn & Glassdoor with <strong>Upstash Redis</strong> caching.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            📁 Where to add code later
          </p>
          <div className="flex flex-col gap-1.5 text-xs font-mono text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-600">API Route:</span>
              <span>src/app/api/jobs/jsearch/route.ts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">Component:</span>
              <span>src/components/jobs/paid-job-board.tsx</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">Cache Helper:</span>
              <span>src/lib/redis.ts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600">Env Vars:</span>
              <span>RAPIDAPI_KEY, UPSTASH_REDIS_URL</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onSwitch}
        className="text-sm text-blue-600 hover:underline font-medium"
      >
        ← Switch to Free Sources
      </button>
    </div>
  )
}