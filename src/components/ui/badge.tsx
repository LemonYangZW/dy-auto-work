import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Zen-iOS Hybrid Badge 组件
 *
 * 设计规范:
 * - iOS 连续曲率圆角
 * - 毛玻璃效果变体
 * - 高对比度颜色
 */
const badgeVariants = cva(
  // 基础样式
  [
    "inline-flex items-center justify-center",
    "px-3 py-1",
    "text-[11px] font-semibold",
    "rounded-full",
    "transition-all duration-150 ease-out",
    "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        // 默认 - 深色高对比
        default: [
          "bg-[var(--primary)] text-[var(--primary-foreground)]",
          "shadow-sm",
        ].join(" "),

        // 次要 - 毛玻璃效果
        secondary: [
          "bg-[var(--muted)] text-[var(--foreground)]",
          "backdrop-blur-sm",
        ].join(" "),

        // 危险
        destructive: [
          "bg-[var(--destructive)] text-[var(--destructive-foreground)]",
          "shadow-sm",
        ].join(" "),

        // 成功
        success: [
          "bg-[var(--success)] text-[var(--success-foreground)]",
          "shadow-sm",
        ].join(" "),

        // 警告
        warning: [
          "bg-[var(--warning)] text-[var(--warning-foreground)]",
          "shadow-sm",
        ].join(" "),

        // 强调色
        accent: [
          "bg-[var(--accent)] text-[var(--accent-foreground)]",
          "shadow-sm",
        ].join(" "),

        // 轮廓 - 透明背景带边框
        outline: [
          "bg-transparent text-[var(--foreground)]",
          "border border-[var(--border)]",
        ].join(" "),

        // 幽灵 - 最小化
        ghost: [
          "bg-transparent text-[var(--muted-foreground)]",
        ].join(" "),
      },
      size: {
        default: "px-3 py-1 text-[11px]",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
