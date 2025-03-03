import confetti from "canvas-confetti"
import { Trans, useTranslation } from "next-i18next"
import { useEffect, useRef, useState } from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { CharacterList } from "~/components/common/CharacterList"
import { PatronModal } from "~/components/common/PatronModal"
import { MintIcon } from "~/components/icons/MintIcon"
import { Modal } from "~/components/ui/Modal"
import { Tooltip } from "~/components/ui/Tooltip"
import { UniLink } from "~/components/ui/UniLink"
import { CSB_SCAN, CSB_XCHAR } from "~/lib/env"
import { Note, Profile } from "~/lib/types"
import { cn } from "~/lib/utils"
import { parsePageId } from "~/models/page.model"
import {
  useCheckLike,
  useCheckMint,
  useGetLikeCounts,
  useGetLikes,
  useGetMints,
  useMintPage,
  useToggleLikePage,
} from "~/queries/page"
import { useGetTips } from "~/queries/site"

import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"

export const Reactions: React.FC<{
  className?: string
  size?: "sm" | "base"
  pageId?: string
  site?: Profile | null
  page?: Note | null
}> = ({ className, size, pageId, site, page }) => {
  const toggleLikePage = useToggleLikePage()
  const mintPage = useMintPage()
  const { t } = useTranslation("common")

  // like
  const account = useAccountState((s) => s.computed.account)
  const [isLikeOpen, setIsLikeOpen] = useState(false)
  const [isLikeListOpen, setIsLikeListOpen] = useState(false)
  const likeRef = useRef<HTMLButtonElement>(null)

  const [likes, likesMutation] = useGetLikes({ pageId })
  const [likeStatus] = useCheckLike({
    pageId,
  })
  const { data: likeCount = 0 } = useGetLikeCounts({ pageId })

  const like = () => {
    if (pageId) {
      if (likeStatus.isLiked) {
        setIsLikeOpen(true)
      } else {
        toggleLikePage.mutate({ ...parsePageId(pageId), action: "link" })
      }
    }
  }

  useEffect(() => {
    if (toggleLikePage.isSuccess) {
      if (likeRef.current?.getBoundingClientRect()) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: {
            x:
              (likeRef.current.getBoundingClientRect().left +
                likeRef.current.getBoundingClientRect().width / 2 || 0.5) /
              window.innerWidth,
            y:
              (likeRef.current.getBoundingClientRect().top || 0.5) /
              window.innerHeight,
          },
        })
      }
    }
  }, [toggleLikePage.isSuccess])

  // mint
  const [isMintOpen, setIsMintOpen] = useState(false)
  const [isMintListOpen, setIsMintListOpen] = useState(false)
  const mintRef = useRef<HTMLButtonElement>(null)

  const mints = useGetMints({
    pageId: pageId,
    includeCharacter: size !== "sm",
  })
  const isMint = useCheckMint(pageId)

  const mint = () => {
    if (pageId) {
      if (isMint.data?.count) {
        setIsMintOpen(true)
      } else {
        mintPage.mutate(parsePageId(pageId))
      }
    }
  }

  useEffect(() => {
    if (mintPage.isSuccess) {
      if (mintRef.current?.getBoundingClientRect()) {
        confetti({
          particleCount: 150,
          spread: 360,
          ticks: 50,
          gravity: 0,
          decay: 0.94,
          startVelocity: 30,
          origin: {
            x:
              (mintRef.current.getBoundingClientRect().left +
                mintRef.current.getBoundingClientRect().width / 2 || 0.5) /
              window.innerWidth,
            y:
              (mintRef.current.getBoundingClientRect().top || 0.5) /
              window.innerHeight,
          },
          shapes: ["star"],
          // cspell:disable-next-line
          colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
        })
      }
    }
  }, [mintPage.isSuccess])

  // tip
  const [isTipOpen, setIsTipOpen] = useState(false)
  const tipRef = useRef<HTMLButtonElement>(null)

  const { characterId, noteId } = parsePageId(pageId || "")
  const tips = useGetTips({
    toCharacterId: characterId,
    toNoteId: noteId,
  })
  const isTip = useGetTips({
    toCharacterId: characterId,
    toNoteId: noteId,
    characterId: account?.characterId || "0",
  })

  const tip = () => {
    if (pageId) {
      setIsTipOpen(true)
    }
  }

  return (
    <>
      <div
        className={cn(
          "xlog-reactions flex fill-gray-400 text-gray-500 sm:items-center",
          size === "sm" ? "text-sm space-x-3" : "space-x-6 sm:space-x-10",
          className,
        )}
        data-hide-print
      >
        <div className={cn("xlog-reactions-like flex items-center sm:mb-0")}>
          <Button
            variant="like"
            className={`flex items-center mr-2 ${
              likeStatus.isLiked && "active"
            }`}
            isAutoWidth={true}
            onClick={like}
            isLoading={toggleLikePage.isPending}
            ref={likeRef}
          >
            {(() => {
              const inner = (
                <span
                  className={cn(
                    "i-mingcute:thumb-up-2-fill mr-1",
                    size === "sm" ? "text-base" : "text-[38px]",
                  )}
                ></span>
              )
              return size !== "sm" ? (
                <Tooltip label={t("Like")} placement="top">
                  {inner}
                </Tooltip>
              ) : (
                inner
              )
            })()}
            <span>{likeCount}</span>
          </Button>
          {size !== "sm" && (
            <ul
              className="-space-x-4 cursor-pointer hidden sm:inline-block"
              onClick={() => setIsLikeListOpen(true)}
            >
              {likes
                ?.sort((a, b) =>
                  b.character?.metadata?.content?.avatars?.[0] ? 1 : -1,
                )
                .slice(0, 3)
                ?.map((like, index) => (
                  <li className="inline-block" key={index}>
                    <Avatar
                      className="relative align-middle border-2 border-white"
                      images={like.character?.metadata?.content?.avatars || []}
                      name={like.character?.metadata?.content?.name}
                      size={40}
                    />
                  </li>
                ))}
              {likeCount > 3 && (
                <li className="inline-block">
                  <div className="relative align-middle border-2 border-white w-10 h-10 rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                    +{likeCount - 3}
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="xlog-reactions-mint flex items-center">
          <Button
            variant="collect"
            className={`flex items-center mr-2 ${
              isMint.isSuccess && isMint.data.count && "active"
            }`}
            isAutoWidth={true}
            onClick={mint}
            isLoading={mintPage.isLoading}
            ref={mintRef}
          >
            {(() => {
              const inner = (
                <MintIcon
                  className={cn(size === "sm" ? "w-3 h-3" : "w-8 h-8")}
                />
              )
              return size !== "sm" ? (
                <Tooltip label={t("Mint to an NFT")} placement="top">
                  {inner}
                </Tooltip>
              ) : (
                inner
              )
            })()}
            <span className="ml-2">{mints.data?.pages?.[0]?.count || 0}</span>
          </Button>
          {size !== "sm" && (
            <ul
              className="-space-x-4 cursor-pointer hidden sm:inline-block"
              onClick={() => setIsMintListOpen(true)}
            >
              {mints.data?.pages?.[0]?.list
                ?.sort((a, b: any) =>
                  b.character?.metadata?.content?.avatars?.[0] ? 1 : -1,
                )
                .slice(0, 3)
                .map((mint: any, index) => (
                  <li className="inline-block" key={index}>
                    <Avatar
                      className="relative align-middle border-2 border-white"
                      images={mint.character?.metadata?.content?.avatars || []}
                      name={mint.character?.metadata?.content?.name}
                      size={40}
                    />
                  </li>
                ))}
              {(mints.data?.pages?.[0]?.count || 0) > 3 && (
                <li className="inline-block">
                  <div className="relative align-middle border-2 border-white w-10 h-10 rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                    +{mints.data!.pages?.[0]?.count - 3}
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
        {size !== "sm" && (
          <div className="xlog-reactions-tip flex items-center">
            <Button
              variant="tip"
              className={`flex items-center mr-2 ${
                isTip.isSuccess && isTip.data.pages?.[0].count && "active"
              }`}
              isAutoWidth={true}
              onClick={tip}
              ref={tipRef}
            >
              {(() => {
                const inner = (
                  <i className="i-mingcute:heart-fill text-[40px]" />
                )
                return (
                  <Tooltip label={t("Tip")} placement="top">
                    {inner}
                  </Tooltip>
                )
              })()}
              <span className="ml-2">{tips.data?.pages?.[0]?.count || 0}</span>
            </Button>
            {
              <ul
                className="-space-x-4 cursor-pointer hidden sm:inline-block"
                onClick={tip}
              >
                {tips.data?.pages?.[0]?.list
                  ?.sort((a, b: any) =>
                    b.character?.metadata?.content?.avatars?.[0] ? 1 : -1,
                  )
                  .slice(0, 3)
                  .map((tip: any, index) => (
                    <li className="inline-block" key={index}>
                      <Avatar
                        className="relative align-middle border-2 border-white"
                        images={tip.character?.metadata?.content?.avatars || []}
                        name={tip.character?.metadata?.content?.name}
                        size={40}
                      />
                    </li>
                  ))}
                {(tips.data?.pages?.[0]?.count || 0) > 3 && (
                  <li className="inline-block">
                    <div className="relative align-middle border-2 border-white w-10 h-10 rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                      +{tips.data!.pages?.[0]?.count - 3}
                    </div>
                  </li>
                )}
              </ul>
            }
          </div>
        )}
        <Modal
          open={isLikeOpen}
          setOpen={setIsLikeOpen}
          title={t("Like successfully") || ""}
        >
          <div className="p-5">
            <Trans i18nKey="like stored">
              Your like has been stored on the blockchain, view it on{" "}
              <UniLink
                className="text-accent"
                href={`${CSB_SCAN}/tx/${likeStatus.transactionHash}`}
              >
                Crossbell Scan
              </UniLink>
            </Trans>
          </div>
          <div className="h-16 border-t flex items-center px-5">
            <Button isBlock onClick={() => setIsLikeOpen(false)}>
              {t("Got it, thanks!")}
            </Button>
          </div>
        </Modal>
        <Modal
          open={isMintOpen}
          setOpen={setIsMintOpen}
          title={t("Mint successfully") || ""}
        >
          <div className="p-5">
            <Trans i18nKey="mint stored">
              This post has been minted to NFT by you, view it on{" "}
              <UniLink
                className="text-accent"
                href={`${CSB_XCHAR}/${account?.character?.handle}/collections`}
              >
                xChar
              </UniLink>{" "}
              or{" "}
              <UniLink
                className="text-accent"
                href={`${CSB_SCAN}/tx/${isMint.data?.list?.[0]?.transactionHash}`}
              >
                Crossbell Scan
              </UniLink>
            </Trans>
          </div>
          <div className="h-16 border-t flex items-center px-5">
            <Button isBlock onClick={() => setIsMintOpen(false)}>
              {t("Got it, thanks!")}
            </Button>
          </div>
        </Modal>
        <PatronModal
          site={site}
          open={isTipOpen}
          setOpen={setIsTipOpen}
          page={page}
        />
        <CharacterList
          open={isLikeListOpen}
          setOpen={setIsLikeListOpen}
          title={t("Like List")}
          loadMore={likesMutation.fetchNextPage}
          hasMore={!!likesMutation.hasNextPage}
          list={likesMutation.data?.pages || []}
        ></CharacterList>
        <CharacterList
          open={isMintListOpen}
          setOpen={setIsMintListOpen}
          title={t("Mint List")}
          loadMore={mints.fetchNextPage}
          hasMore={!!mints.hasNextPage}
          list={mints.data?.pages || []}
        ></CharacterList>
      </div>
    </>
  )
}
