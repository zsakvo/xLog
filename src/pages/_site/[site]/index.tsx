import { GetServerSideProps } from "next"
import type { ReactElement } from "react"

import { QueryClient } from "@tanstack/react-query"

import { SiteHome } from "~/components/site/SiteHome"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { PageVisibilityEnum } from "~/lib/types"
import { useGetPagesBySiteLite } from "~/queries/page"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  const domainOrSubdomain = ctx.params!.site as string
  const { props: layoutProps } = await getLayoutServerSideProps(
    ctx,
    queryClient,
    {
      useStat: true,
    },
  )

  return {
    props: {
      ...layoutProps,
      domainOrSubdomain,
    },
  }
}

function SiteIndexPage({ domainOrSubdomain }: { domainOrSubdomain: string }) {
  const posts = useGetPagesBySiteLite({
    site: domainOrSubdomain,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    useStat: true,
  })

  return (
    <SiteHome
      postPages={posts.data?.pages}
      fetchNextPage={posts.fetchNextPage}
      hasNextPage={posts.hasNextPage}
      isFetchingNextPage={posts.isFetchingNextPage}
    />
  )
}

SiteIndexPage.getLayout = (page: ReactElement) => {
  return (
    <SiteLayout useStat={true} type="index">
      {page}
    </SiteLayout>
  )
}

export default SiteIndexPage
