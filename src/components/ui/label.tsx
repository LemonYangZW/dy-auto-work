import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }

/**
 * LabelIndustrial - 工业风格标签
 * 用于显示区块标题，具有独特的视觉风格
 */
function LabelIndustrial({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="label-industrial"
      className={cn(
        "text-xs font-semibold tracking-wider uppercase text-[var(--muted-foreground)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { LabelIndustrial }
