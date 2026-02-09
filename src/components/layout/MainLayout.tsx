import { Outlet } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

/**
 * 主布局组件 - 悬浮岛式布局
 *
 * 设计规范:
 * - 使用 shadcn/ui Sidebar 组件
 * - 侧边栏和内容区作为独立的悬浮卡片
 * - 毛玻璃材质
 * - macOS 沉浸式标题栏
 */
export function MainLayout() {
  return (
    <SidebarProvider>
      {/* macOS Drag Region - 顶部拖拽区域 */}
      <div
        className="fixed top-0 left-0 right-0 h-[52px] z-50"
        data-tauri-drag-region
      />
      <AppSidebar />
      <SidebarCollapseButton />
      <SidebarInset className="h-svh min-h-0">
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-[52px]">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SidebarCollapseButton() {
  const { state, toggleSidebar } = useSidebar();

  const leftPosition =
    state === "collapsed"
      ? "calc(var(--sidebar-width-icon) - 0.5rem)"
      : "calc(var(--sidebar-width) - 1.5rem)";

  const isCollapsed = state === "collapsed";
  const label = isCollapsed ? "展开侧边栏" : "折叠侧边栏";

  return (
    <div
      className="pointer-events-none fixed top-1/2 z-40 hidden -translate-y-1/2 transition-[left] duration-200 ease-linear md:block"
      style={{ left: leftPosition }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label={label}
        title={label}
        className="glass-float-button pointer-events-auto size-8 rounded-full text-[var(--foreground)]"
      >
        {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </Button>
    </div>
  );
}
