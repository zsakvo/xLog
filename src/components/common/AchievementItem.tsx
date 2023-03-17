import type { AchievementSection } from "crossbell.js"
import { Image } from "~/components/ui/Image"
import { AchievementModal } from "~/components/common/AchievementModal"
import { useEffect, useState } from "react"
import { Indicator } from "@mantine/core"
import { useDate } from "~/hooks/useDate"
import { useTranslation } from "next-i18next"

export const Badge = ({
  media,
  size,
  className,
}: {
  media: string
  size?: number
  className?: string
}) => {
  return (
    <div
      className={
        "inline-block relative rounded-full bg-white shadow-[inset_#a8a29e_6px_-6px_13px] p-[4%]" +
        " " +
        className
      }
      style={{
        width: size || 56,
        height: size || 56,
      }}
    >
      <Image fill alt="achievement" src={media} />
    </div>
  )
}

export const AchievementItem: React.FC<{
  group: AchievementSection["groups"][number]
  layoutId: string
  size?: number
  characterId?: number
  isOwner: boolean
}> = ({ group, layoutId, size, characterId, isOwner }) => {
  const date = useDate()
  const { t } = useTranslation("common")

  const achievement = group.items
    .filter((item) => item.status === "MINTED")
    .pop()

  const achievementMintable = isOwner
    ? group.items.filter((item) => item.status === "MINTABLE").pop()
    : null

  const [opened, setOpened] = useState(false)

  if (isOwner) {
    if (!achievement && !achievementMintable) {
      return null
    }
  } else {
    if (!achievement) {
      return null
    }
  }

  return (
    <div
      className={`achievement-group relative cursor-pointer hover:scale-110 transition-transform ease`}
    >
      <div
        className="inline-flex flex-col text-center items-center w-full"
        onClick={() => {
          setOpened(true)
        }}
      >
        <Badge
          media={(achievement || achievementMintable)!.info.media}
          className={`mb-1 ${!achievement && "grayscale"}`}
          size={size}
        />
        <div className="flex-1 min-w-0 w-full">
          {achievementMintable ? (
            <Indicator
              inline
              withBorder
              processing
              offset={-12}
              size={12}
              position="middle-start"
              color="red"
              className="inline-flex max-w-full justify-center items-center"
            >
              <span className="capitalize text-xs font-medium truncate max-w-full inline-block">
                {group.info.title}
              </span>
            </Indicator>
          ) : (
            <span className="capitalize text-xs font-medium truncate max-w-full inline-block">
              {group.info.title}
            </span>
          )}
          <span className="text-[11px] text-gray-500 leading-snug block">
            {achievement
              ? t("ago", {
                  time: date.dayjs
                    .duration(
                      date
                        .dayjs(achievement.mintedAt)
                        .diff(date.dayjs(), "minute"),
                      "minute",
                    )
                    .humanize(),
                })
              : "Mintable"}
          </span>
        </div>
      </div>
      <AchievementModal
        opened={opened}
        setOpened={setOpened}
        group={group}
        layoutId={layoutId}
        isOwner={isOwner}
      />
    </div>
  )
}
