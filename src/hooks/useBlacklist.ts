import useSWR from "swr"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useBlacklist() {
  const { data, mutate, isLoading } = useSWR("/api/companies/block", fetcher, {
    revalidateOnFocus: false,
  })

  const blacklistedCompanies: string[] = data?.blacklistedCompanies || []

  const blockCompany = async (company: string) => {
    const normalized = company.toLowerCase().trim()
    mutate({ blacklistedCompanies: [...blacklistedCompanies, normalized] }, false)

    try {
      const res = await fetch("/api/companies/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      })
      if (!res.ok) throw new Error()
      toast.success(`"${company}" blocked — won't appear in your feed`)
      mutate()
    } catch {
      toast.error("Failed to block company")
      mutate()
    }
  }

  const unblockCompany = async (company: string) => {
    const normalized = company.toLowerCase().trim()
    mutate({
      blacklistedCompanies: blacklistedCompanies.filter((c) => c !== normalized)
    }, false)

    try {
      const res = await fetch("/api/companies/block", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      })
      if (!res.ok) throw new Error()
      toast.success(`"${company}" unblocked`)
      mutate()
    } catch {
      toast.error("Failed to unblock company")
      mutate()
    }
  }

  const isBlocked = (company: string) =>
    blacklistedCompanies.includes(company.toLowerCase().trim())

  return { blacklistedCompanies, isLoading, blockCompany, unblockCompany, isBlocked }
}