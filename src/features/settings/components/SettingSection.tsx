import { LabelIndustrial } from "@/components/ui";

interface SettingSectionProps {
  /** 区域标题 */
  title: string;
  /** 区域描述 */
  description?: string;
  children: React.ReactNode;
}

/**
 * 设置面板内的区域标题组件
 *
 * 用于给每个配置面板提供统一的标题 + 描述头部
 */
export function SettingSection({
  title,
  description,
  children,
}: SettingSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <LabelIndustrial>{title}</LabelIndustrial>
        {description && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
