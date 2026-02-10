import { cn } from "@/lib/utils";
import { LabelIndustrial } from "@/components/ui";
import type { LucideIcon } from "lucide-react";

/**
 * 设置侧边栏导航项
 */
export interface SettingsNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** 分组标签，同组项归类显示 */
  group: string;
}

interface SettingsSidebarProps {
  items: SettingsNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * 设置页面左侧导航栏
 *
 * 设计规范:
 * - macOS System Settings 风格
 * - 分组标签使用 LabelIndustrial
 * - 选中态高亮圆角背景
 * - 毛玻璃半透明背景
 */
export function SettingsSidebar({
  items,
  activeId,
  onSelect,
}: SettingsSidebarProps) {
  // 按 group 分组
  const groups = items.reduce<Record<string, SettingsNavItem[]>>(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {},
  );

  return (
    <nav className="flex flex-col gap-6 p-4 pt-6">
      {Object.entries(groups).map(([group, groupItems]) => (
        <div key={group} className="space-y-1">
          <LabelIndustrial className="px-3 mb-2">{group}</LabelIndustrial>
          {groupItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 outline-none cursor-pointer",
                  isActive
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
