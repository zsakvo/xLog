import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getAuthUser } from "~/lib/auth.server"
import { createSSGHelpers } from "@trpc/react/ssg"
import { getTRPCContext } from "~/lib/trpc.server"
import { SitePage } from "~/components/site/SitePage"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { getViewer } from "~/lib/viewer"
import { Viewer, Profile, Note } from "~/lib/types"
import { getUserSites, getSite } from "~/models/site.model"
import { getPage } from "~/models/page.model"
import { PageVisibilityEnum } from "~/lib/types"
import { notFound } from "~/lib/server-side-props"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const domainOrSubdomain = ctx.params!.site as string
    const pageSlug = ctx.params!.page as string

    const [site, page] = await Promise.all([
      getSite(domainOrSubdomain),
      getPage({
        site: domainOrSubdomain,
        page: pageSlug,
        render: true,
        includeAuthors: true,
      }),
    ])

    if (new Date(page.date_published) > new Date()) {
      throw notFound()
    }

    return {
      props: {
        site,
        page,
        domainOrSubdomain,
      },
    }
  },
)

function SitePagePage({
  site,
  page,
  domainOrSubdomain,
}: {
  site: Profile,
  page: Note,
  domainOrSubdomain: string
}) {
  const ogDescription = page.summary?.content || page.body?.content

  return (
    <SiteLayout
      site={site!}
      title={page!.title}
      ogDescription={ogDescription}
    >
      <SitePage site={site!} page={page!} />
    </SiteLayout>
  )
}

export default SitePagePage
