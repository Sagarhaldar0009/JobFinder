import { useState, useEffect } from "react"

interface MatchResult {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  matchedKeywords: string[]
  level: "excellent" | "good" | "fair" | "low"
  summary: string
}

interface Job {
  _id: string
  title: string
  description: string
  tags: string[]
}

export function useMatchScores(jobs: Job[]) {
  const [scores, setScores]     = useState<Record<string, MatchResult>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!jobs || jobs.length === 0) return

    const fetchScores = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/jobs/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobs }),
        })

        if (!res.ok) return

        const data = await res.json()
        setScores(data.scores || {})
      } catch (err) {
        console.error("Match score fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScores()
  }, [jobs.map((j) => j._id).join(",")])

  return { scores, isLoading }
}