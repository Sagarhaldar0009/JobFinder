export async function fetchAdzunaJobs(query = "developer", country = "in") {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) {
    console.warn("Adzuna credentials missing")
    return []
  }

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${encodeURIComponent(query)}&content-type=application/json`

    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`Adzuna error: ${res.status}`)

    const data = await res.json()

    return (data.results || []).map((job: any) => ({
      externalId: `adzuna_${job.id}`,
      source: "adzuna",
      title: job.title || "",
      company: job.company?.display_name || "",
      location: job.location?.display_name || "",
      type: job.contract_time || "full-time",
      salary: job.salary_min
        ? `${Math.round(job.salary_min / 1000)}k - ${Math.round((job.salary_max || job.salary_min) / 1000)}k`
        : "",
      description: job.description || "",
      url: job.redirect_url || "",
      tags: job.category?.label ? [job.category.label] : [],
      isRemote: job.title?.toLowerCase().includes("remote") || false,
      postedAt: new Date(job.created || Date.now()),
      fetchedAt: new Date(),
    }))
  } catch (error) {
    console.error("Adzuna fetch error:", error)
    return []
  }
}