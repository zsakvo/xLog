import React from "react"
import { cn } from "~/lib/utils"

export const ButtonGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="button-group">{children}</div>
}

export type Variant =
  | "primary"
  | "secondary"
  | "text"
  | "like"
  | "collect"
  | "crossbell"
  | "outline"
  | "patron"

export type VariantColor = "green" | "red" | "gray" | "gradient" | "black"

type ButtonProps = {
  isLoading?: boolean
  isBlock?: boolean
  isDisabled?: boolean
  isAutoWidth?: boolean
  variant?: Variant
  variantColor?: VariantColor
  outlineColor?: VariantColor
  size?: "sm" | "xl" | "2xl"
  rounded?: "full" | "lg"
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
>(function Button(
  {
    type,
    children,
    className,
    isLoading,
    isDisabled,
    isBlock,
    variant,
    variantColor,
    outlineColor,
    size,
    rounded,
    isAutoWidth,
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type || "button"}
      disabled={isDisabled || isLoading}
      className={cn(
        className,
        "button",
        isLoading && "is-loading",
        isBlock && `is-block`,
        variantColor && `is-${variantColor}`,
        variant === "outline" && outlineColor && `is-outline-${outlineColor}`,
        isDisabled && `is-disabled`,
        isAutoWidth && `is-auto-width`,
        size && `is-${size}`,
        `is-${variant || "primary"}`,
        rounded === "full" ? "rounded-full" : "rounded-lg",
      )}
    >
      {children}
    </button>
  )
})
