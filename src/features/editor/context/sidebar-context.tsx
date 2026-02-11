import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * 编辑器侧边栏插槽 Context
 *
 * 设计模式: Slot Pattern
 * - EditorLayout 提供 Provider，左右面板读取 context 渲染
 * - 各 Workspace 通过 useSidebar Hook 注入自己的侧边栏内容
 * - 切换路由时，旧 Workspace 卸载自动清理，新 Workspace 重新注入
 */

interface SidebarContextType {
  leftSidebar: ReactNode;
  rightSidebar: ReactNode;
  setLeftSidebar: (node: ReactNode) => void;
  setRightSidebar: (node: ReactNode) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [leftSidebar, setLeftSidebar] = useState<ReactNode>(null);
  const [rightSidebar, setRightSidebar] = useState<ReactNode>(null);

  return (
    <SidebarContext.Provider
      value={{ leftSidebar, rightSidebar, setLeftSidebar, setRightSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useSidebarContext must be used within a SidebarProvider",
    );
  }
  return context;
}
