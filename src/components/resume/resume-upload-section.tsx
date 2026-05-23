"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { FreeResumeUpload } from "./free-resume-upload"

export function ResumeUploadSection() {
  const [mode, setMode] = useState<"free" | "paid">("free")

  return (
    <div className="flex flex-col gap-6">

      {/* Toggle */}
      <div className="flex items-center justify-center gap-2 bg-white border rounded-xl p-1.5 w-fit shadow-sm">
        <button
          onClick={() => setMode("free")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "free"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Free Parser
        </button>
        <button
          onClick={() => setMode("paid")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            mode === "paid"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          AI Parser
          <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
            Pro
          </Badge>
        </button>
      </div>

      {/* Content */}
      {mode === "free" ? (
        <FreeResumeUpload />
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
        🤖
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Affinda AI Resume Parser
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          User Story 04 — Option 2 (Paid Version)
        </p>
      </div>

      <div className="bg-white border border-amber-200 rounded-xl p-5 max-w-lg w-full text-left flex flex-col gap-3">
        <p className="text-amber-800 font-semibold text-sm">🚧 Work in Progress</p>
        <p className="text-gray-600 text-sm">
          This version uses the <strong>Affinda Resume Parser API</strong> to extract
          100+ structured fields from your resume with much higher accuracy.
        </p>

        {/* Component location hint */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            📁 Where to add code later
          </p>
          <div className="flex flex-col gap-1.5 text-xs font-mono text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-600">API Route:</span>
              <span>src/app/api/resume/affinda/route.ts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">Component:</span>
              <span>src/components/resume/paid-resume-upload.tsx</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">Lib Helper:</span>
              <span>src/lib/affinda-parser.ts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600">Env Var:</span>
              <span>AFFINDA_API_KEY=your_key_here</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span>💡</span>
          <span>Free tier: 3 docs/day — $0.10/doc after</span>
        </div>
      </div>

      <button
        onClick={onSwitch}
        className="text-sm text-blue-600 hover:underline font-medium"
      >
        ← Switch to Free Parser
      </button>
    </div>
  )
}