import dayjs from "dayjs"

import utc from "dayjs/plugin/utc"
import tz from "dayjs/plugin/timezone"
import localizedFormat from "dayjs/plugin/localizedFormat"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.extend(duration)
dayjs.extend(relativeTime)

export const formatDate = (
  date: string | Date,
  format: "MMM D" | "MMM D, YYYY" | "YYYY" = "MMM D, YYYY",
  timezone?: string,
) => {
  console.log(
    "date",
    date,
    timezone,
    format,
    dayjs(date),
    dayjs(date).tz(timezone),
    dayjs(date).tz(timezone).format(format),
  )
  return dayjs(date).tz(timezone).format(format)
}

export const inLocalTimezone = (date: string | Date) => {
  return dayjs(date).tz().toDate()
}

export default dayjs
