import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface ProviderConfigCardProps {
  /** Provider 唯一标识 */
  id: string;
  /** 显示名称 */
  title: string;
  /** 图标组件 */
  icon: React.ReactNode;
  /** 描述文本 */
  description?: string;
  /** 是否为默认 Provider */
  isDefault?: boolean;
  /** 是否已配置 */
  isConfigured?: boolean;
  /** 具体配置表单 */
  children: React.ReactNode;
}

/**
 * 通用 Provider 配置卡片
 *
 * 设计规范:
 * - 纯净 (solid) 卡片样式，白色背景，清晰可操作感
 * - 顶部: 图标 + 名称 + 状态 Badge
 * - 默认 Provider 左侧边框高亮
 * - children 区域放具体配置项
 */
export function ProviderConfigCard({
  title,
  icon,
  description,
  isDefault = false,
  isConfigured = false,
  children,
}: ProviderConfigCardProps) {
  return (
    <Card
      variant="solid"
      className={cn(
        "transition-all duration-200",
        isDefault && "border-l-2 border-l-[var(--primary)]",
      )}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--muted)]">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <CardDescription className="text-xs mt-0.5">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDefault && (
              <Badge variant="default" className="text-xs">
                默认
              </Badge>
            )}
            <Badge
              variant={isConfigured ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isConfigured
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "",
              )}
            >
              {isConfigured ? "已配置" : "未配置"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">{children}</CardContent>
    </Card>
  );
}
