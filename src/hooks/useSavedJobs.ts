import useSWR from "swr"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useSavedJobs() {
  const { data, mutate, isLoading } = useSWR("/api/jobs/save", fetcher, {
    revalidateOnFocus: false,
  })

  const savedJobs: string[] = data?.savedJobs || []

  const saveJob = async (jobId: string) => {
    // Optimistic update — add immediately
    mutate({ savedJobs: [...savedJobs, jobId] }, false)

    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      if (!res.ok) throw new Error()
      toast.success("Job saved!")
      mutate() // revalidate
    } catch {
      toast.error("Failed to save job")
      mutate() // rollback
    }
  }

  const unsaveJob = async (jobId: string) => {
    // Optimistic update — remove immediately
    mutate({ savedJobs: savedJobs.filter((id) => id !== jobId) }, false)

    try {
      const res = await fetch("/api/jobs/save", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      if (!res.ok) throw new Error()
      toast.success("Job removed from saved")
      mutate()
    } catch {
      toast.error("Failed to unsave job")
      mutate()
    }
  }

  const toggleSave = (jobId: string) => {
    if (savedJobs.includes(jobId)) unsaveJob(jobId)
    else saveJob(jobId)
  }

  return { savedJobs, isLoading, toggleSave, isSaved: (id: string) => savedJobs.includes(id) }
}