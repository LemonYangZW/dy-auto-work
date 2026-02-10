import { NavLink, useLocation } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useTheme } from "@/app/theme";
import {
  Home,
  FolderOpen,
  LayoutGrid,
  Settings,
  Palette,
  Monitor,
  Sun,
  Moon,
  Info,
  ExternalLink,
  MessageSquareWarning,
  Sparkles,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Menu items
const menuItems = [
  {
    title: "首页",
    path: "/",
    icon: Home,
  },
  {
    title: "项目库",
    path: "/projects",
    icon: FolderOpen,
  },
  {
    title: "模板库",
    path: "/templates",
    icon: LayoutGrid,
  },
];

const bottomItems = [
  {
    title: "设置",
    path: "/settings",
    icon: Settings,
  },
];

const PROJECT_REPO_URL = "https://github.com/LemonYangZW/dy-auto-work";
const FEEDBACK_URL = `${PROJECT_REPO_URL}/issues`;

export function AppSidebar() {
  const location = useLocation();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { state, toggleSidebar } = useSidebar();

  const handleOpenLink = async (url: string) => {
    try {
      await openUrl(url);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" variant="floating">
      {/* macOS Overlay 标题栏下方的拖拽安全区 */}
      <div
        data-tauri-drag-region
        style={{ height: "var(--titlebar-height)" }}
      />
      {/* Header with Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="cursor-default">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AI 视频工作台</span>
                  <span className="truncate text-xs text-muted-foreground">
                    从创意到成片
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Navigation */}
      <SidebarFooter>
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.path)}
                tooltip={item.title}
              >
                <NavLink to={item.path}>
                  <item.icon />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <SidebarMenuButton tooltip="外观">
                  <Palette />
                  <span>外观</span>
                </SidebarMenuButton>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
                <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border)] bg-background p-6 shadow-xl outline-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="text-lg font-semibold tracking-tight">
                        外观偏好
                      </Dialog.Title>
                      <Dialog.Description className="mt-1 text-sm text-[var(--muted-foreground)]">
                        主题切换后立即生效，并自动保存为下次启动默认值。
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                        aria-label="关闭外观窗口"
                      >
                        <X className="size-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="mt-5 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className={`justify-start ${theme === "light" ? "!border-[#f5c26b] !bg-[#fff4dd] !text-[#8a5500] hover:!bg-[#ffecc8]" : ""}`}
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="size-4" />
                        浅色模式
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className={`justify-start ${theme === "system" ? "!border-[var(--primary)] !bg-[var(--primary)]/10 !text-[var(--primary)] hover:!bg-[var(--primary)]/15" : ""}`}
                        onClick={() => setTheme("system")}
                      >
                        <Monitor className="size-4" />
                        跟随系统
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className={`justify-start ${theme === "dark" ? "!border-[#1f2937] !bg-[#111827] !text-[#f9fafb] hover:!bg-[#1f2937]" : ""}`}
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="size-4" />
                        深色模式
                      </Button>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      当前模式：
                      {theme === "system"
                        ? `跟随系统（当前：${resolvedTheme === "dark" ? "深色模式" : "浅色模式"}）`
                        : theme === "light"
                          ? "浅色模式"
                          : "深色模式"}
                    </p>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <SidebarMenuButton tooltip="关于">
                  <Info />
                  <span>关于</span>
                </SidebarMenuButton>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
                <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border)] bg-background p-6 shadow-xl outline-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="text-lg font-semibold tracking-tight">
                        抖音 AI 视频工作台
                      </Dialog.Title>
                      <Dialog.Description className="mt-1 text-sm text-[var(--muted-foreground)]">
                        从创意到成片的全流程工具
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                        aria-label="关闭关于窗口"
                      >
                        <X className="size-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="mt-5 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">版本</span>
                      <span className="font-medium">{__APP_VERSION__}</span>
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                      这是一个开源的 AI 视频创作工具，帮助创作者将灵感更快落地为可发布内容。
                    </p>
                    <div className="space-y-2 text-sm leading-6">
                      <p>
                        <span className="font-medium text-foreground">开源协作：</span>
                        <span className="text-[var(--muted-foreground)]">
                          欢迎通过 Issue / PR 一起共建功能与体验。
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-foreground">产品理念：</span>
                        <span className="text-[var(--muted-foreground)]">
                          本地优先、流程清晰、专注提升创作效率。
                        </span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="justify-start"
                        onClick={() => void handleOpenLink(PROJECT_REPO_URL)}
                      >
                        <ExternalLink className="size-4" />
                        项目仓库
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="justify-start"
                        onClick={() => void handleOpenLink(FEEDBACK_URL)}
                      >
                        <MessageSquareWarning className="size-4" />
                        问题反馈
                      </Button>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </SidebarMenuItem>
          {/* 折叠/展开按钮 */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={state === "collapsed" ? "展开侧边栏" : "折叠侧边栏"}
              onClick={toggleSidebar}
            >
              {state === "collapsed" ? <PanelLeftOpen /> : <PanelLeftClose />}
              <span>折叠侧边栏</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}
