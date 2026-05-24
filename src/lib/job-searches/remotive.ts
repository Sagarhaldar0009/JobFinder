export async function fetchRemotiveJobs(query = "developer") {
  try {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=50`

    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`Remotive error: ${res.status}`)

    const data = await res.json()

    return (data.jobs || []).map((job: any) => ({
      externalId: `remotive_${job.id}`,
      source: "remotive",
      title: job.title || "",
      company: job.company_name || "",
      location: job.candidate_required_location || "Remote",
      type: job.job_type || "full-time",
      salary: job.salary || "",
      description: job.description || "",
      url: job.url || "",
      tags: job.tags || [],
      isRemote: true,
      postedAt: new Date(job.publication_date || Date.now()),
      fetchedAt: new Date(),
    }))
  } catch (error) {
    console.error("Remotive fetch error:", error)
    return []
  }
}