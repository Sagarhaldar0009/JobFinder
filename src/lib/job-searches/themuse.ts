export async function fetchTheMuseJobs(query = "developer") {
  const apiKey = process.env.THE_MUSE_API_KEY

  try {
    const keyParam = apiKey ? `&api_key=${apiKey}` : ""
    const url = `https://www.themuse.com/api/public/jobs?descending=true&page=1&per_page=50${keyParam}`

    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`The Muse error: ${res.status}`)

    const data = await res.json()

    return (data.results || [])
      .filter((job: any) =>
        job.name?.toLowerCase().includes(query.toLowerCase()) ||
        job.contents?.toLowerCase().includes(query.toLowerCase())
      )
      .map((job: any) => ({
        externalId: `themuse_${job.id}`,
        source: "themuse",
        title: job.name || "",
        company: job.company?.name || "",
        location: job.locations?.[0]?.name || "Flexible",
        type: job.type || "full-time",
        salary: "",
        description: job.contents?.replace(/<[^>]*>/g, "") || "",
        url: job.refs?.landing_page || "",
        tags: job.categories?.map((c: any) => c.name) || [],
        isRemote: job.locations?.some((l: any) =>
          l.name?.toLowerCase().includes("remote")
        ) || false,
        postedAt: new Date(job.publication_date || Date.now()),
        fetchedAt: new Date(),
      }))
  } catch (error) {
    console.error("The Muse fetch error:", error)
    return []
  }
}