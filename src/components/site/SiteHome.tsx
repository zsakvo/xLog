import Link from "next/link"
import { formatDate } from "~/lib/date"
import { Paginated, type PostOnSiteHome, Notes } from "~/lib/types"
import { EmptyState } from "../ui/EmptyState"

export const SiteHome: React.FC<{
  posts?: Notes
}> = ({ posts }) => {
  if (!posts) return null

  return (
    <div className="">
      {posts.total === 0 && <EmptyState />}
      {posts.total > 0 && (
        <div className="xlog-posts space-y-3">
          {posts.list.map((post) => {
            const excerpt = post.summary?.content
            return (
              <Link key={post.slug} href={`/${post.slug}`}>
                <a className="xlog-post block hover:bg-zinc-100 transition-colors p-5 -mx-5 first:-mt-5 md:rounded-xl">
                  <h3 className="xlog-post-title text-2xl font-bold">
                    {post.title}
                  </h3>
                  <div className="xlog-post-date text-sm text-zinc-400 mt-1">
                    {formatDate(post.date_published)}
                  </div>
                  <div className="xlog-post-excerpt mt-3 text-zinc-500">
                    {excerpt}
                    {excerpt && "..."}
                  </div>
                </a>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
