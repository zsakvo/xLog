import { redirect } from "~/lib/server-side-props"
import { useGetUserSites } from "~/queries/site"
import { useAccount } from 'wagmi'
import { useEffect } from "react"
import { useRouter } from 'next/router'

export default function Dashboard() {
  const { data: wagmiData } = useAccount()
  const router = useRouter()
  const userSites = useGetUserSites(wagmiData?.address)

  useEffect(() => {
    if (userSites.isSuccess) {
      if (!userSites.data?.length) {
        router.push(`/dashboard/new-site`)
      } else {
        router.push(`/dashboard/${userSites.data[0].username}`)
      }
    }
  }, [userSites, router])

  return <div>Loading...</div>
}
