"use client"

import { useState, useEffect } from "react"
import { useSavedJobs } from "@/hooks/useSavedJobs"
import { useBlacklist } from "@/hooks/useBlacklist"
import { SaveJobButton } from "./save-job-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Job {
  _id: string
  title: string
  company: string
  location: string
  salary: string
  url: string
  source: "adzuna" | "remotive" | "themuse"
  isRemote: boolean
  postedAt: string
  tags: string[]
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

export function SavedJobsView() {
  const { savedJobs, isLoading: savedLoading } = useSavedJobs()
  const { blacklistedCompanies, unblockCompany, isLoading: blacklistLoading } = useBlacklist()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [activeTab, setActiveTab] = useState<"saved" | "blocked">("saved")
  const [newCompany, setNewCompany] = useState("")
  const { blockCompany } = useBlacklist()

  useEffect(() => {
    if (savedJobs.length === 0) { setJobs([]); return }

    const fetchSavedJobs = async () => {
      setIsFetching(true)
      try {
        const params = new URLSearchParams()
        savedJobs.forEach((id) => params.append("ids", id))

        const res = await fetch(`/api/jobs/saved?${params}`)
        const data = await res.json()
        setJobs(data.jobs || [])
      } catch {
        console.error("Failed to fetch saved jobs")
      } finally {
        setIsFetching(false)
      }
    }

    fetchSavedJobs()
  }, [savedJobs.join(",")])

  const handleAddBlacklist = () => {
    if (!newCompany.trim()) return
    blockCompany(newCompany.trim())
    setNewCompany("")
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-800 border dark:border-gray-700
        rounded-xl p-1.5 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "saved"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          🔖 Saved Jobs
          {savedJobs.length > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {savedJobs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("blocked")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "blocked"
              ? "bg-red-500 text-white shadow"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          🚫 Blocked Companies
          {blacklistedCompanies.length > 0 && (
            <span className="ml-2 bg-red-400 text-white text-xs px-1.5 py-0.5 rounded-full">
              {blacklistedCompanies.length}
            </span>
          )}
        </button>
      </div>

      {/* Saved Jobs Tab */}
      {activeTab === "saved" && (
        <div className="flex flex-col gap-4">
          {(savedLoading || isFetching) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700
                  rounded-2xl p-5 animate-pulse h-40" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="text-6xl">🔖</span>
              <div className="text-center">
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-lg">
                  No saved jobs yet
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Click the bookmark icon on any job card to save it here
                </p>
              </div>
              <a href="/jobs">
                <Button variant="outline">Browse Jobs →</Button>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <Card key={job._id}
                  className="shadow-sm hover:shadow-md transition-all border
                    dark:bg-gray-800 dark:border-gray-700 hover:border-blue-200
                    dark:hover:border-blue-700 group">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <a href={`/jobs/${job._id}`}
                          className="font-semibold text-gray-900 dark:text-gray-100 text-sm
                            line-clamp-2 hover:text-blue-600 transition-colors">
                          {job.title}
                        </a>
                        <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <SaveJobButton jobId={job._id} size="sm" />
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                          ${SOURCE_COLORS[job.source]}`}>
                          {SOURCE_LABELS[job.source]}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {job.location && <span>📍 {job.location}</span>}
                      {job.isRemote && <span className="text-green-600 font-medium">🌍 Remote</span>}
                      {job.salary && <span className="font-medium text-gray-700 dark:text-gray-300">💰 {job.salary}</span>}
                    </div>

                    {job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary"
                            className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1 border-t dark:border-gray-700">
                      <a href={`/jobs/${job._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs
                          dark:border-gray-600 dark:text-gray-300">
                          View Details
                        </Button>
                      </a>
                      <a href={job.url} target="_blank" rel="noopener noreferrer"
                        className="flex-1">
                        <Button size="sm" className="w-full text-xs">
                          Apply Now →
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blocked Companies Tab */}
      {activeTab === "blocked" && (
        <div className="flex flex-col gap-5">

          {/* Add manually */}
          <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold dark:text-gray-100">
                🚫 Block a Company Manually
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Toxic Corp, Previous Employer..."
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddBlacklist() }}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
                <Button onClick={handleAddBlacklist} variant="destructive">
                  Block
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Blocked companies won't appear in your job feed.
                You can also block from any job card.
              </p>
            </CardContent>
          </Card>

          {/* Blocked list */}
          {blacklistLoading ? (
            <div className="animate-pulse h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          ) : blacklistedCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-5xl">✅</span>
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                No blocked companies
              </p>
              <p className="text-sm text-gray-400">
                Block companies from job cards or add them above
              </p>
            </div>
          ) : (
            <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold dark:text-gray-100">
                  Blocked Companies ({blacklistedCompanies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col divide-y dark:divide-gray-700">
                  {blacklistedCompanies.map((company) => (
                    <div key={company}
                      className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">🚫</span>
                        <span className="text-sm font-medium text-gray-700
                          dark:text-gray-300 capitalize">
                          {company}
                        </span>
                      </div>
                      <button
                        onClick={() => unblockCompany(company)}
                        className="text-xs text-gray-400 hover:text-blue-600
                          dark:hover:text-blue-400 transition-colors font-medium"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}