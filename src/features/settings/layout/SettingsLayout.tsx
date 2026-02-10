import { ScrollArea } from "@/components/ui";

interface SettingsLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 设置页面分栏布局
 *
 * 设计规范:
 * - 左侧 260px 固定宽度导航栏，毛玻璃背景
 * - 右侧弹性内容区，ScrollArea 包裹
 * - Zen-iOS Hybrid 风格
 */
export function SettingsLayout({ sidebar, children }: SettingsLayoutProps) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 左侧侧边栏 */}
      <aside className="w-[260px] shrink-0 border-r border-[var(--border)] bg-[var(--sidebar-background)]/60 backdrop-blur-xl overflow-y-auto">
        {sidebar}
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 min-w-0">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto p-8 pb-20 space-y-6">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
