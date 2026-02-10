import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTitlebarHeight } from "@/hooks/use-platform";
import { Toaster } from "@/components/ui";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * 根布局组件
 * 包含全局样式和基础结构
 */
export function RootLayout() {
  // 在根布局统一初始化标题栏安全高度，确保所有路由一致
  useTitlebarHeight();

  // 禁用 Tauri webview 默认右键菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Outlet />
        <Toaster position="bottom-right" richColors />
      </div>
    </QueryClientProvider>
  );
}
