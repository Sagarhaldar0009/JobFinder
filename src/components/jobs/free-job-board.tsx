"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

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

interface Pagination {
  total: number
  page: number
  pages: number
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

export function FreeJobBoard() {
  const router     = useRouter()
  const pathname   = usePathname()
  const searchParams = useSearchParams()

  // ── State from URL params ────────────────────────────
  const [search,    setSearch]    = useState(searchParams.get("search") || "")
  const [source,    setSource]    = useState(searchParams.get("source") || "")
  const [remote,    setRemote]    = useState(searchParams.get("remote") === "true")
  const [dateRange, setDateRange] = useState(searchParams.get("dateRange") || "")
  const [sortBy,    setSortBy]    = useState(searchParams.get("sortBy") || "recent")
  const [page,      setPage]      = useState(parseInt(searchParams.get("page") || "1"))

  const [jobs,       setJobs]       = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1 })
  const [isLoading,  setIsLoading]  = useState(true)
  const [isSyncing,  setIsSyncing]  = useState(false)
  const [searchInput, setSearchInput] = useState(search)

  // ── Sync filters to URL ──────────────────────────────
  const updateURL = useCallback((params: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    Object.entries(params).forEach(([key, value]) => {
      if (value) current.set(key, value)
      else current.delete(key)
    })
    router.replace(`${pathname}?${current.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  // ── Fetch jobs ───────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sortBy,
        ...(search    && { search }),
        ...(source    && { source }),
        ...(remote    && { remote: "true" }),
        ...(dateRange && { dateRange }),
      })

      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setJobs(data.jobs || [])
      setPagination(data.pagination)

      if (data.fallback) {
        toast.info("Using basic search — Atlas Search index is still building")
      }
    } catch {
      toast.error("Failed to load jobs")
    } finally {
      setIsLoading(false)
    }
  }, [search, source, remote, dateRange, sortBy, page])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  // ── Handlers ─────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
    updateURL({ search: searchInput, page: "1" })
  }

  const handleSourceChange = (val: string) => {
    setSource(val)
    setPage(1)
    updateURL({ source: val, page: "1" })
  }

  const handleRemoteToggle = () => {
    const next = !remote
    setRemote(next)
    setPage(1)
    updateURL({ remote: next ? "true" : "", page: "1" })
  }

  const handleDateRange = (val: string) => {
    const next = dateRange === val ? "" : val
    setDateRange(next)
    setPage(1)
    updateURL({ dateRange: next, page: "1" })
  }

  const handleSort = (val: string) => {
    setSortBy(val)
    updateURL({ sortBy: val })
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    updateURL({ page: p.toString() })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSync = async () => {
    setIsSyncing(true)
    const toastId = toast.loading("Syncing jobs from all sources...")
    try {
      const res = await fetch("/api/jobs/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer dev-sync-secret`,
           Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
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

  const handleClearFilters = () => {
    setSearch("")
    setSearchInput("")
    setSource("")
    setRemote(false)
    setDateRange("")
    setSortBy("recent")
    setPage(1)
    router.replace(pathname)
  }

  const hasActiveFilters = search || source || remote || dateRange || sortBy !== "recent"

  return (
    <div className="flex flex-col gap-5">

      {/* Search Bar */}
      <form onSubmit={handleSearch}
        className="flex gap-2 bg-white border rounded-2xl p-3 shadow-sm">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Search jobs, companies, skills... (fuzzy search enabled)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 border-0 shadow-none focus-visible:ring-0 bg-transparent"
          />
        </div>
        <Button type="submit" disabled={isLoading}>Search</Button>
        <Button type="button" variant="outline" onClick={handleSync}
          disabled={isSyncing} className="shrink-0">
          {isSyncing ? "Syncing..." : "🔄 Sync"}
        </Button>
      </form>

      {/* Filters Row */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3">

        {/* Row 1 — Source + Remote */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-full md:w-auto">
            Source
          </span>
          {(["", "adzuna", "remotive", "themuse"] as const).map((s) => (
            <button key={s || "all"} onClick={() => handleSourceChange(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                source === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 hover:border-blue-300 hover:text-blue-600"
              }`}>
              {s === "" ? "All Sources" : SOURCE_LABELS[s]}
            </button>
          ))}
          <div className="h-4 w-px bg-gray-200 mx-1 hidden md:block" />
          <button onClick={handleRemoteToggle}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              remote
                ? "bg-green-600 text-white border-green-600"
                : "text-gray-600 hover:border-green-400 hover:text-green-600"
            }`}>
            🌍 Remote Only
          </button>
        </div>

        {/* Row 2 — Date Range + Sort */}
        <div className="flex flex-wrap gap-2 items-center border-t pt-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-full md:w-auto">
            Posted
          </span>
          {[
            { label: "Today",    value: "1" },
            { label: "3 Days",   value: "3" },
            { label: "1 Week",   value: "7" },
            { label: "1 Month",  value: "30" },
          ].map((opt) => (
            <button key={opt.value} onClick={() => handleDateRange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                dateRange === opt.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 hover:border-blue-300"
              }`}>
              {opt.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort:</span>
            {[
              { label: "Most Recent", value: "recent" },
              { label: "Relevance",   value: "relevance" },
            ].map((opt) => (
              <button key={opt.value} onClick={() => handleSort(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  sortBy === opt.value
                    ? "bg-gray-800 text-white border-gray-800"
                    : "text-gray-600 hover:border-gray-400"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3 — Active filters + count */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              {isLoading ? "Loading..." : `${pagination.total} jobs found`}
            </span>
            {search && (
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                🔍 "{search}"
              </Badge>
            )}
            {remote && (
              <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                🌍 Remote
              </Badge>
            )}
            {dateRange && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                📅 Last {dateRange}d
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <button onClick={handleClearFilters}
              className="text-xs text-red-500 hover:underline font-medium">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Atlas Search Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-blue-500 text-lg">🔍</span>
        <div>
          <p className="text-xs font-semibold text-blue-800">
            Fuzzy Search Enabled (Atlas Search)
          </p>
          <p className="text-xs text-blue-600">
            "React developer" also finds "React.js engineer", "ReactJS dev" and similar roles
          </p>
        </div>

        {/* Paid Version Placeholder hint */}
        <div className="ml-auto bg-white border border-blue-200 rounded-lg px-3 py-2 text-right hidden md:block">
          <p className="text-[10px] font-semibold text-amber-600">💎 Pro Upgrade Available</p>
          <p className="text-[10px] text-gray-400">
            📁 src/components/jobs/paid-job-board.tsx
          </p>
          <p className="text-[10px] text-gray-400">
            Add JSearch (Indeed + LinkedIn + Glassdoor)
          </p>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl p-5 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="flex gap-1 mb-3">
                <div className="h-5 bg-gray-100 rounded-full w-16" />
                <div className="h-5 bg-gray-100 rounded-full w-20" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-4/5 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/5" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
            {search ? "🔍" : "📭"}
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700 text-lg">
              {search ? `No results for "${search}"` : "No jobs yet"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search
                ? "Try different keywords or clear the search"
                : "Click Sync to fetch the latest listings"}
            </p>
          </div>
          {!search && (
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? "Syncing..." : "🔄 Sync Jobs Now"}
            </Button>
          )}
          {search && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
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
          <Button variant="outline" size="sm"
            onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            ← Prev
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.pages ||
                Math.abs(p - page) <= 1)
              .reduce((acc: (number | string)[], p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...")
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-gray-400 text-sm">...</span>
                ) : (
                  <button key={p} onClick={() => handlePageChange(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      page === p
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}>
                    {p}
                  </button>
                )
              )}
          </div>

          <Button variant="outline" size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pagination.pages}>
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
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 border hover:border-blue-200 group flex flex-col">
      <CardContent className="p-5 flex flex-col gap-3 flex-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium truncate">
              {job.company}
            </p>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold shrink-0 ${SOURCE_COLORS[job.source]}`}>
            {SOURCE_LABELS[job.source]}
          </span>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          {job.location && (
            <span className="flex items-center gap-1 truncate max-w-[160px]">
              📍 {job.location}
            </span>
          )}
          {job.isRemote && (
            <span className="text-green-600 font-semibold flex items-center gap-1">
              🌍 Remote
            </span>
          )}
          {job.salary && (
            <span className="text-gray-700 font-semibold flex items-center gap-1">
              💰 {job.salary}
            </span>
          )}
          {job.type && job.type !== "full-time" && (
            <span className="capitalize text-gray-500">
              🕒 {job.type}
            </span>
          )}
        </div>

        {/* Tags */}
        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary"
                className="text-[10px] px-2 py-0 bg-gray-100 text-gray-600 capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div className="flex-1">
            <p className={`text-xs text-gray-500 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
              {job.description.substring(0, 300)}
              {job.description.length > 300 && !expanded && "..."}
            </p>
            {job.description.length > 200 && (
              <button onClick={() => setExpanded(!expanded)}
                className="text-xs text-blue-500 hover:underline mt-1">
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t mt-auto">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            🕐 {timeAgo(job.postedAt)}
          </span>
          <a href={job.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">
            Apply Now
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

      </CardContent>
    </Card>
  )
}