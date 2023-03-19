import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { useForm, Controller } from "react-hook-form"
import { useGetSite, useUpdateSite } from "~/queries/site"
import { UniLink } from "~/components/ui/UniLink"
import { ImageUploader } from "~/components/ui/ImageUploader"
import { toIPFS } from "~/lib/ipfs-parser"
import type { ReactElement } from "react"
import { useTranslation, Trans } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const { props: layoutProps } = await getLayoutServerSideProps(ctx)

    return {
      props: {
        ...layoutProps,
      },
    }
  },
)

export default function SiteSettingsGeneralPage() {
  const router = useRouter()

  const subdomain = router.query.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)
  const { t } = useTranslation("dashboard")

  const form = useForm({
    defaultValues: {
      icon: "",
      banner: undefined,
      name: "",
      description: "",
      ga: "",
    } as {
      icon: string
      banner?: {
        address: string
        mime_type: string
      }
      name: string
      description: string
      ga: string
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    updateSite.mutate({
      icon: values.icon,
      banner: values.banner,
      site: subdomain,
      name: values.name,
      description: values.description,
      ga: values.ga,
    })
  })

  useEffect(() => {
    if (updateSite.isSuccess) {
      if (updateSite.data?.code === 0) {
        toast.success("Site updated")
      } else {
        toast.error("Failed to update site" + ": " + updateSite.data.message)
      }
    } else if (updateSite.isError) {
      toast.error("Failed to update site")
    }
  }, [updateSite.isSuccess, updateSite.isError])

  useEffect(() => {
    if (site.data) {
      !form.getValues("icon") &&
        form.setValue("icon", toIPFS(site.data?.avatars?.[0] || ""))
      !form.getValues("banner") &&
        form.setValue(
          "banner",
          site.data?.banners?.[0]
            ? {
                address: toIPFS(site.data?.banners?.[0].address || ""),
                mime_type: site.data?.banners?.[0].mime_type,
              }
            : undefined,
        )
      !form.getValues("name") && form.setValue("name", site.data.name || "")
      !form.getValues("description") &&
        form.setValue("description", site.data.bio || "")
      !form.getValues("ga") && form.setValue("ga", site.data.ga || "")
    }
  }, [site.data, form])

  const [iconUploading, setIconUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)

  return (
    <SettingsLayout title="Site Settings" type="site">
      <form onSubmit={handleSubmit}>
        <div className="mt-5">
          <label htmlFor="icon" className="form-label">
            {t("Icon")}
          </label>
          <Controller
            name="icon"
            control={form.control}
            render={({ field }) => (
              <ImageUploader
                id="icon"
                className="w-24 h-24 rounded-full"
                uploadStart={() => {
                  setIconUploading(true)
                }}
                uploadEnd={(key) => {
                  form.setValue("icon", key as string)
                  setIconUploading(false)
                }}
                {...field}
              />
            )}
          />
        </div>
        <div className="mt-5">
          <label htmlFor="icon" className="form-label">
            {t("Banner")}
          </label>
          <Controller
            name="banner"
            control={form.control}
            render={({ field }) => (
              <ImageUploader
                id="banner"
                className="max-w-screen-md h-[220px]"
                uploadStart={() => {
                  setBannerUploading(true)
                }}
                uploadEnd={(key) => {
                  form.setValue(
                    "banner",
                    key as { address: string; mime_type: string },
                  )
                  setBannerUploading(false)
                }}
                withMimeType={true}
                hasClose={true}
                {...(field as any)}
              />
            )}
          />
          <div className="text-xs text-gray-400 mt-1">
            {t("Supports both pictures and videos.")}
          </div>
        </div>
        <div className="mt-5">
          <Input
            required
            label={t("Name") || ""}
            id="name"
            {...form.register("name")}
          />
        </div>
        <div className="mt-5">
          <label htmlFor="description" className="form-label">
            {t("Description")}
          </label>
          <Input
            multiline
            id="description"
            className="input is-block"
            rows={2}
            {...form.register("description")}
          />
        </div>
        <div className="mt-5">
          <Input
            id="ga"
            {...form.register("ga")}
            prefix="G-"
            label="Google Analytics"
            help={
              <p>
                <Trans i18nKey="Integrate Google Analytics" ns="dashboard">
                  Integrate Google Analytics into your site. You can follow the
                  instructions{" "}
                  <UniLink
                    className="underline"
                    href="https://support.google.com/analytics/answer/9539598"
                  >
                    here
                  </UniLink>{" "}
                  to find your Measurement ID.
                </Trans>
              </p>
            }
          />
        </div>
        <div className="mt-5">
          <Button
            type="submit"
            isLoading={updateSite.isLoading}
            isDisabled={iconUploading || bannerUploading}
          >
            {t("Save")}
          </Button>
        </div>
      </form>
      {/* <div className="mt-14 border-t pt-8">
      <h3 className="text-red-500 text-lg mb-5">Danger Zone</h3>
      <form>
        <Button variantColor="red" type="submit">
          Delete Site
        </Button>
      </form>
    </div> */}
    </SettingsLayout>
  )
}

SiteSettingsGeneralPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Site Settings">{page}</DashboardLayout>
}
