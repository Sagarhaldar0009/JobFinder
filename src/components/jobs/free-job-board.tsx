"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface Job {
  _id: string
  externalId: string
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

interface Pagination {
  total: number
  page: number
  pages: number
}

const SOURCE_COLORS = {
  adzuna: "bg-blue-100 text-blue-700",
  remotive: "bg-green-100 text-green-700",
  themuse: "bg-purple-100 text-purple-700",
}

const SOURCE_LABELS = {
  adzuna: "Adzuna",
  remotive: "Remotive",
  themuse: "The Muse",
}

export function FreeJobBoard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [search, setSearch] = useState("")
  const [source, setSource] = useState("")
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [page, setPage] = useState(1)

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(source && { source }),
        ...(remoteOnly && { remote: "true" }),
      })

      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setJobs(data.jobs || [])
      setPagination(data.pagination)
    } catch {
      toast.error("Failed to load jobs")
    } finally {
      setIsLoading(false)
    }
  }, [search, source, remoteOnly, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSync = async () => {
    setIsSyncing(true)
    const toastId = toast.loading("Syncing jobs from all sources...")
    try {
      const res = await fetch("/api/jobs/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "dev-sync-secret"}`,
        },
        body: JSON.stringify({ query: search || "developer" }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      toast.success(
        `Synced ${data.total} jobs — Adzuna: ${data.sources.adzuna}, Remotive: ${data.sources.remotive}, The Muse: ${data.sources.themuse}`,
        { id: toastId, duration: 5000 }
      )
      fetchJobs()
    } catch {
      toast.error("Sync failed", { id: toastId })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Search + Filters */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search jobs, companies, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
            className="shrink-0"
          >
            {isSyncing ? "Syncing..." : "🔄 Sync Jobs"}
          </Button>
        </form>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 font-medium">Filter:</span>

          {/* Source Filter */}
          {(["", "adzuna", "remotive", "themuse"] as const).map((s) => (
            <button
              key={s || "all"}
              onClick={() => { setSource(s); setPage(1) }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                source === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 hover:border-gray-400"
              }`}
            >
              {s === "" ? "All Sources" : SOURCE_LABELS[s]}
            </button>
          ))}

          <div className="h-4 w-px bg-gray-200 mx-1" />

          {/* Remote Toggle */}
          <button
            onClick={() => { setRemoteOnly(!remoteOnly); setPage(1) }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              remoteOnly
                ? "bg-green-600 text-white border-green-600"
                : "text-gray-600 hover:border-gray-400"
            }`}
          >
            🌍 Remote Only
          </button>

          {/* Results count */}
          <span className="ml-auto text-xs text-gray-400">
            {pagination.total} jobs found
          </span>
        </div>
      </div>

      {/* Empty State — No jobs yet */}
      {!isLoading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
            📭
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700 text-lg">No jobs found</p>
            <p className="text-gray-400 text-sm mt-1">
              Click "🔄 Sync Jobs" to fetch the latest listings from all sources
            </p>
          </div>
          <Button onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? "Syncing..." : "🔄 Sync Jobs Now"}
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* Job Cards Grid */}
      {!isLoading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            {pagination.pages > 5 && (
              <span className="text-gray-400 text-sm px-1">
                ... {pagination.pages}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Job Card ──────────────────────────────────────────────
function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false)

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 border hover:border-blue-200 group">
      <CardContent className="p-5 flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{job.company}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${SOURCE_COLORS[job.source]}`}>
            {SOURCE_LABELS[job.source]}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {job.location && (
            <span className="flex items-center gap-1">
              📍 {job.location.length > 25 ? job.location.substring(0, 25) + "..." : job.location}
            </span>
          )}
          {job.isRemote && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              🌍 Remote
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1 text-gray-600 font-medium">
              💰 {job.salary}
            </span>
          )}
        </div>

        {/* Tags */}
        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 bg-gray-100 text-gray-600">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div>
            <p className={`text-xs text-gray-500 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
              {job.description.substring(0, 300)}
              {job.description.length > 300 && !expanded && "..."}
            </p>
            {job.description.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-500 hover:underline mt-1"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t mt-auto">
          <span className="text-xs text-gray-400">{timeAgo(job.postedAt)}</span>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            Apply Now →
          </a>
        </div>

      </CardContent>
    </Card>
  )
}