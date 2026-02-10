import { Outlet } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

/**
 * 主布局组件 - 悬浮岛式布局
 *
 * 设计规范:
 * - 使用 shadcn/ui Sidebar 组件
 * - 侧边栏和内容区作为独立的悬浮卡片
 * - 毛玻璃材质
 * - macOS Overlay 标题栏（内容延伸到标题栏区域，需自定义 drag-region）
 * - 折叠按钮集成在侧边栏 Footer 内部（避免与内容区 Card 重叠）
 *
 * 平台适配:
 * - 通过 CSS 变量 `--titlebar-height` 统一安全高度（macOS: 28px）
 */
export function MainLayout() {
  return (
    <SidebarProvider>
      {/* macOS Overlay 标题栏拖拽区域 */}
      <div
        className="fixed top-0 left-0 right-0 z-[60]"
        data-tauri-drag-region
        style={{ height: "var(--titlebar-height)" }}
      />
      <AppSidebar />
      <SidebarInset className="h-svh min-h-0 bg-transparent">
        <div className="flex flex-1 flex-col h-full p-2 pt-[calc(var(--titlebar-height)+0.5rem)] transition-[padding] duration-200 ease-linear">
          <Card variant="glass" className="flex-1 flex flex-col overflow-hidden rounded-[24px] border-white/20 shadow-sm">
            <Outlet />
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
