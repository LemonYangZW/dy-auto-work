import { useLayoutEffect, type ReactNode } from "react";
import { useSidebarContext } from "../context/sidebar-context";

/**
 * useSidebar - 侧边栏注入 Hook
 *
 * 各 Workspace 调用此 Hook 注册左右侧边栏内容。
 * 使用 useLayoutEffect 确保在浏览器绘制前更新，避免闪烁。
 * 组件卸载时自动清理（设为 null）。
 *
 * @example
 * ```tsx
 * function ScriptWorkspace() {
 *   useSidebar(<ScriptLeftSidebar />, <ScriptRightSidebar />);
 *   return <div>...</div>;
 * }
 * ```
 */
export function useSidebar(
  left: ReactNode,
  right: ReactNode,
) {
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();

  useLayoutEffect(() => {
    setLeftSidebar(left);
    setRightSidebar(right);

    return () => {
      setLeftSidebar(null);
      setRightSidebar(null);
    };
    // 故意不添加 left/right 到依赖数组：
    // 侧边栏内容由各 Workspace 的 render 提供，每次 render 都是新的 ReactNode 引用。
    // 若添加会导致无限循环。内容更新由 Workspace 自身的 re-render 驱动。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLeftSidebar, setRightSidebar]);
}
