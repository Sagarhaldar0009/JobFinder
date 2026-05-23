"use client"

import { useState } from "react"
import { FreeOnboarding } from "./free-onboarding"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Props {
  userName: string
}

export function OnboardingFlow({ userName }: Props) {
  const [mode, setMode] = useState<"free" | "paid">("free")

  return (
    <div className="flex flex-col gap-6">

      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 bg-white border rounded-xl p-1.5 w-fit mx-auto shadow-sm">
        <button
          onClick={() => setMode("free")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "free"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Free Version
        </button>
        <button
          onClick={() => setMode("paid")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            mode === "paid"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          AI-Powered
          <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
            Pro
          </Badge>
        </button>
      </div>

      {/* Content */}
      {mode === "free" ? (
        <FreeOnboarding userName={userName} />
      ) : (
        <Card className="border-dashed border-2 border-amber-300">
          <CardContent className="py-16 flex flex-col items-center text-center gap-4">
            <div className="text-5xl">🤖</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                AI-Powered Onboarding
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                User Story 03 — Option 2 (Paid Version)
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-4 max-w-md">
              <p className="text-amber-800 text-sm font-medium">
                🚧 Work in Progress - [Code Location :src/components/onboarding/onboarding-flow.tsx]
              </p>
              <p className="text-amber-700 text-sm mt-1">
                This version uses Claude AI (Haiku) to suggest job titles and
                skill keywords as you type for a smarter onboarding experience.
              </p>
              <p className="text-amber-600 text-xs mt-3 font-medium">
                For now, please use the Free Version →
              </p>
            </div>
            <button
              onClick={() => setMode("free")}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Switch to Free Version
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}