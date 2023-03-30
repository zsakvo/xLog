import Link from "next/link"
import { useDate } from "~/hooks/useDate"
import { EmptyState } from "../ui/EmptyState"
import { useRouter } from "next/router"
import { Image } from "~/components/ui/Image"
import { useTranslation } from "next-i18next"
import { useGetFeed } from "~/queries/home"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { useAccountState } from "@crossbell/connect-kit"
import InfiniteScroll from "react-infinite-scroller"
import { ExpandedNote } from "~/lib/types"
import { useEffect, useState } from "react"
import { Switch } from "@headlessui/react"
import { setStorage, getStorage } from "~/lib/storage"

const Post = ({
  post,
  filtering,
}: {
  post: ExpandedNote
  filtering: number
}) => {
  const router = useRouter()
  const { t } = useTranslation(["common", "site"])
  const date = useDate()

  if (
    post.metadata?.content?.score?.number &&
    post.metadata.content.score.number <= filtering
  ) {
    return null
  }

  return (
    <div>
      <div className="flex items-center space-x-2">
        <CharacterFloatCard siteId={post.character?.handle}>
          <div className="flex items-center space-x-4 cursor-pointer">
            <span className="w-10 h-10 inline-block">
              <Image
                className="rounded-full"
                src={
                  post.character?.metadata?.content?.avatars?.[0] ||
                  "ipfs://bafkreiabgixxp63pg64moxnsydz7hewmpdkxxi3kdsa4oqv4pb6qvwnmxa"
                }
                alt={post.character?.handle || ""}
                width="40"
                height="40"
              ></Image>
            </span>
            <span className="font-medium">
              {post.character?.metadata?.content?.name ||
                post.character?.handle}
            </span>
          </div>
        </CharacterFloatCard>
        <span className="text-zinc-400">·</span>
        <time
          dateTime={date.formatToISO(post.createdAt)}
          className="xlog-post-date whitespace-nowrap text-zinc-400 text-sm"
        >
          {t("ago", {
            time: date.dayjs
              .duration(
                date.dayjs(post?.createdAt).diff(date.dayjs(), "minute"),
                "minute",
              )
              .humanize(),
          })}
        </time>
      </div>
      <Link
        target="_blank"
        href={`/api/redirection?characterId=${post.characterId}&noteId=${post.noteId}`}
        className="xlog-post sm:hover:bg-hover bg-white transition-all p-4 ml-10 sm:rounded-xl flex flex-col sm:flex-row items-center"
      >
        <div className="flex-1 flex justify-center flex-col w-full min-w-0">
          <h3 className="xlog-post-title text-2xl font-bold text-zinc-700">
            {post.metadata?.content?.title}
          </h3>
          <div className="xlog-post-meta text-sm text-zinc-400 mt-1 space-x-4 flex items-center mr-8">
            {!!post.metadata?.content?.tags?.filter(
              (tag) => tag !== "post" && tag !== "page",
            ).length && (
              <span className="xlog-post-tags space-x-1 truncate min-w-0">
                {post.metadata?.content?.tags
                  ?.filter((tag) => tag !== "post" && tag !== "page")
                  .map((tag) => (
                    <span
                      className="hover:text-zinc-600"
                      key={tag}
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/tag/${tag}`)
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
              </span>
            )}
          </div>
          <div
            className="xlog-post-excerpt mt-3 text-zinc-500 line-clamp-2"
            style={{
              wordBreak: "break-word",
            }}
          >
            {post.metadata?.content?.summary}
            {post.metadata?.content?.summary && "..."}
          </div>
        </div>
        {post.metadata?.content.cover && (
          <div className="xlog-post-cover flex items-center relative w-full sm:w-24 h-40 sm:h-24 mt-2 sm:ml-4 sm:mt-0">
            <Image
              className="object-cover rounded"
              alt="cover"
              fill={true}
              src={post.metadata?.content.cover}
            ></Image>
          </div>
        )}
      </Link>
    </div>
  )
}

export const MainFeed: React.FC<{
  type?: "latest" | "recommend" | "following"
}> = ({ type }) => {
  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )

  const feed = useGetFeed({
    type: type,
    characterId: currentCharacterId,
  })

  const hasFiltering = type === "latest"

  const [aiFiltering, setAiFiltering] = useState(false)

  useEffect(() => {
    setAiFiltering(getStorage("ai_filtering")?.enabled || false)
  }, [])

  return (
    <>
      <InfiniteScroll
        loadMore={feed.fetchNextPage as any}
        hasMore={feed.hasNextPage}
        loader={
          <div
            className="relative mt-4 w-full text-sm text-center py-4"
            key={"loading"}
          >
            Loading ...
          </div>
        }
      >
        {hasFiltering && (
          <div className="mb-10 flex items-center text-zinc-500">
            <i className="i-mingcute:android-2-line mr-2 text-lg" />
            <span>Enable AI Filtering</span>
            <Switch
              checked={aiFiltering}
              onChange={(value) => {
                setAiFiltering(value)
                setStorage("ai_filtering", {
                  enabled: value,
                })
              }}
              className={`${
                aiFiltering ? "bg-accent" : "bg-gray-200"
              } ml-5 relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">Enable AI Filtering</span>
              <span
                className={`${
                  aiFiltering ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>
        )}
        {feed.isLoading ? (
          <div className="text-center">Loading...</div>
        ) : !feed.data?.pages[0]?.count ? (
          <EmptyState />
        ) : (
          <div className="xlog-posts space-y-8">
            {feed.data?.pages.map((posts) =>
              posts?.list.map((post) => {
                return (
                  <Post
                    key={`${post.characterId}-${post.noteId}`}
                    post={post}
                    filtering={aiFiltering ? 60 : 0}
                  />
                )
              }),
            )}
          </div>
        )}
      </InfiniteScroll>
    </>
  )
}
