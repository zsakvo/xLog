import equal from "fast-deep-equal"
import { nanoid } from "nanoid"
import { GetServerSideProps } from "next"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import type { ReactElement } from "react"
import toast from "react-hot-toast"
import { ReactSortable } from "react-sortablejs"

import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { SiteNavigationItem } from "~/lib/types"
import { useGetSite, useUpdateSite } from "~/queries/site"

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

type UpdateItem = (id: string, newItem: Partial<SiteNavigationItem>) => void

type RemoveItem = (id: string) => void

const SortableNavigationItem: React.FC<{
  item: SiteNavigationItem
  updateItem: UpdateItem
  removeItem: RemoveItem
}> = ({ item, updateItem, removeItem }) => {
  const { t } = useTranslation("dashboard")
  return (
    <div className="flex space-x-5 border-b p-5 bg-zinc-50 last:border-0">
      <div>
        <button
          type="button"
          className="drag-handle cursor-grab -mt-1 text-zinc-400 rounded-lg h-8 w-6 flex items-center justify-center hover:text-zinc-800 hover:bg-zinc-200"
        >
          <svg className="w-5 h-8" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9 20q-.825 0-1.412-.587Q7 18.825 7 18q0-.825.588-1.413Q8.175 16 9 16t1.413.587Q11 17.175 11 18q0 .825-.587 1.413Q9.825 20 9 20Zm0-6q-.825 0-1.412-.588Q7 12.825 7 12t.588-1.413Q8.175 10 9 10t1.413.587Q11 11.175 11 12q0 .825-.587 1.412Q9.825 14 9 14Zm0-6q-.825 0-1.412-.588Q7 6.825 7 6t.588-1.412Q8.175 4 9 4t1.413.588Q11 5.175 11 6t-.587 1.412Q9.825 8 9 8Zm6 0q-.825 0-1.412-.588Q13 6.825 13 6t.588-1.412Q14.175 4 15 4t1.413.588Q17 5.175 17 6t-.587 1.412Q15.825 8 15 8Zm0 6q-.825 0-1.412-.588Q13 12.825 13 12t.588-1.413Q14.175 10 15 10t1.413.587Q17 11.175 17 12q0 .825-.587 1.412Q15.825 14 15 14Zm0 6q-.825 0-1.412-.587Q13 18.825 13 18q0-.825.588-1.413Q14.175 16 15 16t1.413.587Q17 17.175 17 18q0 .825-.587 1.413Q15.825 20 15 20Z"
            ></path>
          </svg>
        </button>
      </div>
      <Input
        label={t("Label") || ""}
        required
        id={`${item.id}-label`}
        value={item.label}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateItem(item.id, { label: e.target.value })
        }
      />
      <Input
        label={t("URL") || ""}
        required
        id={`${item.id}-url`}
        type="text"
        value={item.url}
        pattern="(https?://|/)(.*)?"
        title="URL must start with / or http:// or https://"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateItem(item.id, { url: e.target.value })
        }
      />
      <div className="flex items-end relative -top-[5px]">
        <Button onClick={() => removeItem(item.id)} variantColor="red">
          {t("Remove")}
        </Button>
      </div>
    </div>
  )
}

export default function SiteSettingsNavigationPage() {
  const router = useRouter()

  const subdomain = router.query.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)
  const { t } = useTranslation("dashboard")

  const [items, setItems] = useState<SiteNavigationItem[]>([])

  const itemsModified = useMemo(() => {
    if (!site.isSuccess) return false
    return !equal(items, site.data?.navigation)
  }, [items, site.data, site.isSuccess])

  const updateItem: UpdateItem = (id, newItem) => {
    setItems((items) => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, ...newItem }
        }
        return item
      })
    })
  }

  const newEmptyItem = () => {
    setItems((items) => [...items, { id: nanoid(), label: "", url: "" }])
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateSite.mutate({
      site: site.data?.username!,
      navigation: items,
    })
  }

  useEffect(() => {
    if (updateSite.isSuccess) {
      if (updateSite.data?.code === 0) {
        toast.success("Saved")
      } else {
        toast.error("Failed to save" + ": " + updateSite.data.message)
      }
    } else if (updateSite.isError) {
      toast.error("Failed to save")
    }
  }, [updateSite.isSuccess, updateSite.isError])

  const removeItem: RemoveItem = (id) => {
    setItems((items) => items.filter((item) => item.id !== id))
  }

  const [hasSet, setHasSet] = useState(false)
  useEffect(() => {
    if (site.data?.navigation && !hasSet) {
      setHasSet(true)
      setItems(site.data?.navigation)
    }
  }, [site.data?.navigation, hasSet])

  return (
    <SettingsLayout title="Site Settings" type="site">
      <div className="p-5 text-zinc-500 bg-zinc-50 mb-5 rounded-lg text-xs space-y-2">
        <p className="text-zinc-800 text-sm font-bold">{t("Tips")}:</p>
        <p>
          <span className="text-zinc-800 font-medium">
            {t("xLog provides some out-of-the-box built-in pages")}:
          </span>
        </p>
        <p>
          <span className="text-zinc-800">- {t("Home page")}:</span>{" "}
          <span className="bg-zinc-200 rounded-lg px-2">/</span>
        </p>
        <p>
          <span className="text-zinc-800">- {t("Archives page")}:</span>{" "}
          <span className="bg-zinc-200 rounded-lg px-2">/archives</span>
        </p>
        <p>
          <span className="text-zinc-900">- {t("Tag page")}:</span>{" "}
          <span className="bg-zinc-200 rounded-lg px-2">/tag/[tag]</span>
        </p>
        <p>
          <span className="text-zinc-900">- {t("NFT Showcase page")}:</span>{" "}
          <span className="bg-zinc-200 rounded-lg px-2">/nft</span>
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-50 rounded-lg overflow-hidden">
          {items.length === 0 && (
            <div className="text-center text-zinc-500 p-5">
              No navigation items yet
            </div>
          )}
          <ReactSortable list={items} setList={setItems} handle=".drag-handle">
            {items.map((item) => {
              return (
                <SortableNavigationItem
                  key={item.id}
                  item={item}
                  updateItem={updateItem}
                  removeItem={removeItem}
                />
              )
            })}
            <style jsx global>{`
              .sortable-ghost {
                opacity: 0.4;
              }
            `}</style>
          </ReactSortable>
        </div>
        <div className="border-t pt-5 mt-10 space-x-3 flex items-center">
          <Button
            type="submit"
            isLoading={updateSite.isLoading}
            isDisabled={!itemsModified}
          >
            {t("Save")}
          </Button>
          <Button variant="secondary" onClick={newEmptyItem}>
            {t("New Item")}
          </Button>
        </div>
      </form>
    </SettingsLayout>
  )
}

SiteSettingsNavigationPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Site Settings">{page}</DashboardLayout>
}
