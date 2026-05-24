"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { estimateSalary } from "@/lib/salary-estimator"
import { detectRedFlags } from "@/lib/red-flag-detector"
import { MatchScoreBadge } from "./match-score-badge"

interface Job {
  _id: string
  source: "adzuna" | "remotive" | "themuse"
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  url: string
  tags: string[]
  isRemote: boolean
  postedAt: string
}

interface MatchResult {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  matchedKeywords: string[]
  level: "excellent" | "good" | "fair" | "low"
  summary: string
}

interface Props {
  job: Job
  matchResult: MatchResult
  userName: string
}

const SOURCE_COLORS = {
  adzuna:   "bg-blue-100 text-blue-700",
  remotive: "bg-green-100 text-green-700",
  themuse:  "bg-purple-100 text-purple-700",
}

const SOURCE_LABELS = {
  adzuna:   "Adzuna",
  remotive: "Remotive",
  themuse:  "The Muse",
}

const SEVERITY_STYLES = {
  high:   "bg-red-50 border-red-200 text-red-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  low:    "bg-gray-50 border-gray-200 text-gray-600",
}

const SEVERITY_ICONS = {
  high:   "🚨",
  medium: "⚠️",
  low:    "💡",
}

export function JobDetailView({ job, matchResult, userName }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "company" | "intel">("overview")

  const salary    = estimateSalary(job.title, job.location, job.salary)
  const redFlags  = detectRedFlags(job.description)
  const timeAgo   = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  // Format description into paragraphs
  const formatDescription = (text: string) => {
    return text
      .replace(/<[^>]*>/g, " ")  // strip HTML
      .split(/\n+/)
      .filter((p) => p.trim().length > 0)
      .map((p, i) => <p key={i} className="text-sm text-gray-600 leading-relaxed">{p.trim()}</p>)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">

      {/* Back Button */}
      <Link href="/jobs"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 w-fit transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Jobs
      </Link>

      {/* Hero Card */}
      <Card className="shadow-md border-0 overflow-hidden">
        {/* Colored top bar based on match */}
        <div className={`h-1.5 w-full ${
          matchResult.level === "excellent" ? "bg-green-500" :
          matchResult.level === "good"      ? "bg-blue-500"  :
          matchResult.level === "fair"      ? "bg-amber-400" : "bg-gray-300"
        }`} />

        <CardContent className="p-6 flex flex-col gap-5">

          {/* Top Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Company Avatar */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600
                flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm">
                {job.company.charAt(0).toUpperCase() || "?"}
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                <p className="text-base text-gray-600 font-medium mt-0.5">{job.company}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                  {job.location && <span>📍 {job.location}</span>}
                  {job.isRemote && <span className="text-green-600 font-medium">🌍 Remote</span>}
                  <span>🕐 {timeAgo(job.postedAt)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[job.source]}`}>
                    via {SOURCE_LABELS[job.source]}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Score */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <MatchScoreBadge result={matchResult} />
              <p className="text-xs text-gray-400 text-right max-w-[160px]">
                {matchResult.summary.substring(0, 60)}...
              </p>
            </div>
          </div>

          <Separator />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon="💰"
              label="Salary Est."
              value={salary.label}
              sub={salary.isEstimate ? "Estimated" : "Listed"}
              color="green"
            />
            <StatCard
              icon="🎯"
              label="Match Score"
              value={`${matchResult.score}%`}
              sub={matchResult.level.charAt(0).toUpperCase() + matchResult.level.slice(1)}
              color={
                matchResult.level === "excellent" ? "green" :
                matchResult.level === "good"      ? "blue"  :
                matchResult.level === "fair"      ? "amber" : "gray"
              }
            />
            <StatCard
              icon="⚡"
              label="Matched Skills"
              value={`${matchResult.matchedSkills.length}`}
              sub="from your profile"
              color="blue"
            />
            <StatCard
              icon="🚨"
              label="Red Flags"
              value={`${redFlags.length}`}
              sub={redFlags.length === 0 ? "Looks clean!" : "detected"}
              color={redFlags.length === 0 ? "green" : redFlags.length >= 3 ? "red" : "amber"}
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <Button className="gap-2 px-6">
                Apply Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Button>
            </a>
            <Button variant="outline" className="gap-2">
              📋 Save Job
            </Button>
            <Button variant="outline" className="gap-2">
              📤 Share
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white border rounded-xl p-1.5 w-fit shadow-sm">
        {(["overview", "company", "intel"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab === "overview" && "📄 Overview"}
            {tab === "company"  && "🏢 Company"}
            {tab === "intel"    && `🔍 Intel ${redFlags.length > 0 ? `(${redFlags.length})` : ""}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Tags */}
              {job.tags.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">🏷️ Job Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="secondary"
                          className="capitalize bg-blue-50 text-blue-700 border-blue-100">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Full Description */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">📋 Job Description</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {formatDescription(job.description)}
                </CardContent>
              </Card>
            </>
          )}

          {/* Company Tab */}
          {activeTab === "company" && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">🏢 About {job.company}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600
                    flex items-center justify-center text-white text-2xl font-bold shadow">
                    {job.company.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{job.company}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Hiring for: {job.title}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoRow icon="📍" label="Location" value={job.location || "Not specified"} />
                  <InfoRow icon="🌍" label="Remote" value={job.isRemote ? "Yes" : "No"} />
                  <InfoRow icon="💼" label="Job Type" value={job.type || "Full-time"} />
                  <InfoRow icon="📡" label="Source" value={SOURCE_LABELS[job.source]} />
                </div>

                {/* Paid Version Placeholder */}
                <div className="border-2 border-dashed border-amber-300 rounded-xl p-5 mt-2">
                  <p className="text-amber-700 font-semibold text-sm flex items-center gap-2">
                    💎 Pro: Glassdoor Company Intelligence
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    User Story 09 — Option 2 (Paid Version) — Work on it Later
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      📁 Where to add code later
                    </p>
                    <div className="flex flex-col gap-1.5 text-xs font-mono text-gray-500">
                      <span><span className="text-green-600">API Route:</span> src/app/api/company/glassdoor/route.ts</span>
                      <span><span className="text-blue-600">Component:</span> src/components/jobs/glassdoor-intel.tsx</span>
                      <span><span className="text-purple-600">AI Summary:</span> src/components/jobs/ai-red-flag-summary.tsx</span>
                      <span><span className="text-orange-600">Env Vars:</span> RAPIDAPI_KEY, GLASSDOOR_API_KEY</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <p className="font-semibold mb-1">📋 Tasks to complete:</p>
                      <ul className="list-disc list-inside flex flex-col gap-1">
                        <li>Call Glassdoor via RapidAPI → get rating, reviews count, CEO approval</li>
                        <li>Display star rating, pros/cons from recent reviews</li>
                        <li>Send top 5 reviews to Claude Haiku → extract red flag summary</li>
                        <li>Show "3 employees mentioned poor management" style insights</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Intel Tab */}
          {activeTab === "intel" && (
            <div className="flex flex-col gap-5">

              {/* Red Flags */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    🚨 Red Flag Analysis
                    {redFlags.length === 0 && (
                      <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        ✅ No flags detected
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {redFlags.length === 0 ? (
                    <div className="flex flex-col items-center py-8 gap-3 text-center">
                      <span className="text-5xl">✅</span>
                      <p className="font-semibold text-green-700">Looks Clean!</p>
                      <p className="text-sm text-gray-400">
                        No red flags detected in this job description.
                      </p>
                    </div>
                  ) : (
                    redFlags.map((flag, i) => (
                      <div key={i}
                        className={`flex items-start gap-3 border rounded-xl p-3 ${SEVERITY_STYLES[flag.severity]}`}>
                        <span className="text-lg shrink-0">{SEVERITY_ICONS[flag.severity]}</span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                            {flag.type}
                          </p>
                          <p className="text-sm font-medium mt-0.5">{flag.message}</p>
                        </div>
                        <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5
                          rounded-full shrink-0 ${
                          flag.severity === "high"
                            ? "bg-red-200 text-red-700"
                            : flag.severity === "medium"
                            ? "bg-amber-200 text-amber-700"
                            : "bg-gray-200 text-gray-600"
                        }`}>
                          {flag.severity}
                        </span>
                      </div>
                    ))
                  )}

                  {/* AI Red Flag Upgrade Hint */}
                  <div className="border-2 border-dashed border-amber-200 rounded-xl p-4 mt-2">
                    <p className="text-amber-700 font-semibold text-sm">
                      💎 Pro: AI-Powered Red Flag Summary
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Uses Claude Haiku to analyze Glassdoor reviews and surface
                      patterns like "4 employees mentioned poor work-life balance"
                    </p>
                    <div className="mt-2 text-xs font-mono text-gray-400 flex flex-col gap-0.5">
                      <span>📁 src/components/jobs/ai-red-flag-summary.tsx</span>
                      <span>📁 src/app/api/jobs/redflag-ai/route.ts</span>
                      <span>🔑 Needs: ANTHROPIC_API_KEY + Glassdoor reviews</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Salary Intelligence */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">💰 Salary Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className={`flex items-center justify-between p-4 rounded-xl ${
                    salary.isEstimate ? "bg-blue-50 border border-blue-200" : "bg-green-50 border border-green-200"
                  }`}>
                    <div>
                      <p className={`text-xl font-bold ${salary.isEstimate ? "text-blue-700" : "text-green-700"}`}>
                        {salary.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {salary.isEstimate
                          ? "Estimated based on role + location"
                          : "As listed by employer"}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      salary.isEstimate
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {salary.isEstimate ? "Estimate" : "Confirmed"}
                    </span>
                  </div>
                  {salary.isEstimate && (
                    <p className="text-xs text-gray-400 italic">
                      💡 Tip: Always confirm salary during the first call.
                      Actual offers may vary based on experience and negotiation.
                    </p>
                  )}
                </CardContent>
              </Card>

            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">

          {/* Match Breakdown */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">🎯 Your Match</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">

              {/* Score Circle */}
              <div className="flex flex-col items-center py-2">
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center
                  border-4 font-bold text-2xl ${
                  matchResult.level === "excellent" ? "border-green-500 text-green-600 bg-green-50" :
                  matchResult.level === "good"      ? "border-blue-500 text-blue-600 bg-blue-50"   :
                  matchResult.level === "fair"      ? "border-amber-400 text-amber-600 bg-amber-50" :
                  "border-gray-300 text-gray-500 bg-gray-50"
                }`}>
                  {matchResult.score}%
                </div>
                <p className={`text-sm font-semibold mt-2 capitalize ${
                  matchResult.level === "excellent" ? "text-green-600" :
                  matchResult.level === "good"      ? "text-blue-600"  :
                  matchResult.level === "fair"      ? "text-amber-600" : "text-gray-500"
                }`}>
                  {matchResult.level} Match
                </p>
              </div>

              <Separator />

              {/* Matched Skills */}
              {matchResult.matchedSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1.5">
                    ✅ You have ({matchResult.matchedSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.matchedSkills.map((skill) => (
                      <span key={skill}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 capitalize">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {matchResult.missingSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-500 mb-1.5">
                    📚 Upskill in ({matchResult.missingSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.missingSkills.map((skill) => (
                      <span key={skill}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 capitalize">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Apply Card */}
          <Card className="shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
            <CardContent className="p-5 flex flex-col gap-3">
              <p className="font-semibold">Ready to apply?</p>
              <p className="text-xs text-blue-100">
                Your profile is {matchResult.score}% aligned with this role.
              </p>
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                  Apply on {SOURCE_LABELS[job.source]} →
                </Button>
              </a>
              <p className="text-[10px] text-blue-200 text-center">
                Opens in a new tab
              </p>
            </CardContent>
          </Card>

          {/* Job Details Summary */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">📌 Job Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <InfoRow icon="💼" label="Type"     value={job.type || "Full-time"} />
              <InfoRow icon="📍" label="Location" value={job.location || "Not specified"} />
              <InfoRow icon="🌍" label="Remote"   value={job.isRemote ? "Yes" : "No"} />
              <InfoRow icon="📅" label="Posted"   value={timeAgo(job.postedAt)} />
              <InfoRow icon="📡" label="Source"   value={SOURCE_LABELS[job.source]} />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, color,
}: {
  icon: string
  label: string
  value: string
  sub: string
  color: string
}) {
  const colors: Record<string, string> = {
    green: "text-green-600",
    blue:  "text-blue-600",
    amber: "text-amber-600",
    red:   "text-red-500",
    gray:  "text-gray-500",
  }
  return (
    <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1">
      <span className="text-xl">{icon}</span>
      <p className={`text-lg font-bold ${colors[color] || "text-gray-700"}`}>{value}</p>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-base">{icon}</span>
      <span className="text-gray-400 text-xs w-16 shrink-0">{label}</span>
      <span className="text-gray-700 font-medium text-xs capitalize">{value}</span>
    </div>
  )
}