import { z } from "zod"
import { siteController } from "~/controllers/site.controller"
import { createRouter } from "~/lib/trpc.server"
import { PageVisibilityEnum } from "~/lib/types"
import { getSite, getSubscription } from "~/models/site.model"

export const siteRouter = createRouter()
  .query("subscription", {
    input: z.object({
      site: z.string(),
    }),
    output: z
      .object({
        email: z.boolean().optional(),
        telegram: z.boolean().optional(),
      })
      .nullable(),
    async resolve({ input, ctx }) {
      const user = ctx.gate.getUser()
      if (!user) return null
      const site = await getSite(input.site)
      const subscription = await getSubscription({
        siteId: site.id,
        userId: user.id,
      })
      return subscription
        ? {
            email: subscription.config.email,
            telegram: subscription.config.telegram,
          }
        : null
    },
  })
  .query("pages", {
    input: z.object({
      site: z.string(),
      type: z.enum(["post", "page"]).default("post"),
      visibility: z
        .enum([
          PageVisibilityEnum.All,
          PageVisibilityEnum.Published,
          PageVisibilityEnum.Draft,
          PageVisibilityEnum.Scheduled,
        ])
        .nullish(),
      take: z.number().optional(),
      cursor: z.string().optional(),
    }),
    output: z.object({
      nodes: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          publishedAt: z.date().transform((v) => v.toISOString()),
          published: z.boolean(),
          slug: z.string(),
          excerpt: z.string(),
        })
      ),
      total: z.number(),
      hasMore: z.boolean(),
    }),
    async resolve({ input, ctx }) {
      const result = await siteController.getPages(ctx.gate, input)
      return result
    },
  })
  .query("page", {
    input: z.object({
      site: z.string(),
      page: z.string(),
      renderContent: z.boolean().optional(),
    }),
    output: z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      published: z.boolean(),
      publishedAt: z.date().transform((v) => v.toISOString()),
      slug: z.string(),
      type: z.enum(["PAGE", "POST"]),
    }),
    async resolve({ input, ctx }) {
      const page = await siteController.getPage(ctx.gate, input)
      return page
    },
  })
  .mutation("updateSite", {
    input: z.object({
      site: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().nullish().optional(),
      subdomain: z.string().optional(),
    }),
    output: z.object({
      site: z.object({
        id: z.string(),
        name: z.string(),
        subdomain: z.string(),
      }),
      subdomainUpdated: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      const { site, subdomainUpdated } = await siteController.updateSite(
        ctx.gate,
        input
      )
      return {
        site,
        subdomainUpdated,
      }
    },
  })
  .mutation("createOrUpdatePage", {
    input: z.object({
      siteId: z.string(),
      pageId: z.string().optional(),
      title: z.string().optional(),
      content: z.string().optional(),
      published: z.boolean().optional(),
      publishedAt: z.string().optional(),
      excerpt: z.string().optional(),
      isPost: z.boolean(),
      slug: z.string().optional(),
    }),
    output: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const { page } = await siteController.createOrUpdatePage(ctx.gate, input)
      return page
    },
  })
  .mutation("create", {
    input: z.object({
      name: z.string(),
      subdomain: z.string().min(2).max(20),
    }),
    output: z.object({
      id: z.string(),
      subdomain: z.string(),
    }),
    async resolve({ input, ctx }) {
      const { site } = await siteController.createSite(ctx.gate, input)
      return site
    },
  })
  .mutation("deletePage", {
    input: z.object({
      pageId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await siteController.deletePage(ctx.gate, { id: input.pageId })
    },
  })
