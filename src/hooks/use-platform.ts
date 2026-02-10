import { useState, useEffect } from "react";
import { platform } from "@tauri-apps/plugin-os";

export type Platform = "macos" | "windows" | "linux" | "unknown";

/**
 * macOS 标题栏安全高度 (px)
 *
 * 说明：
 * - `titleBarStyle: "Overlay"` 模式下，Webview 延伸到标题栏区域，需要预留安全高度避免内容被遮挡。
 * - 标准 macOS 标题栏高度为 28px。
 */
const MACOS_TITLEBAR_HEIGHT = 28;

/**
 * 检测当前运行平台
 *
 * 用于区分 macOS / Windows / Linux，
 * 以便处理沉浸式标题栏等平台差异化行为。
 */
export function usePlatform(): Platform {
  const [os, setOs] = useState<Platform>("unknown");

  useEffect(() => {
    try {
      const p = platform();
      if (p === "macos") setOs("macos");
      else if (p === "windows") setOs("windows");
      else if (p === "linux") setOs("linux");
      else setOs("unknown");
    } catch {
      // 非 Tauri 环境（浏览器开发模式），通过 userAgent 降级检测
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes("mac")) setOs("macos");
      else if (ua.includes("win")) setOs("windows");
      else if (ua.includes("linux")) setOs("linux");
      else setOs("unknown");
    }
  }, []);

  return os;
}

/**
 * 获取标题栏安全区高度并同步到 CSS 变量
 *
 * 在根组件中调用一次即可，会自动设置 `--titlebar-height` CSS 变量：
 * - macOS: 28px（Overlay 标题栏，需预留安全高度）
 * - Windows / Linux: 0px（使用系统原生标题栏）
 *
 * 其他组件通过 CSS `var(--titlebar-height)` 引用即可。
 */
export function useTitlebarHeight(): number {
  const os = usePlatform();
  const height = os === "macos" ? MACOS_TITLEBAR_HEIGHT : 0;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--titlebar-height",
      `${height}px`
    );
  }, [height]);

  return height;
}
