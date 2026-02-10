import { useState } from "react";
import { SettingsLayout } from "./layout/SettingsLayout";
import {
  SettingsSidebar,
  type SettingsNavItem,
} from "./layout/SettingsSidebar";
import { GeneralPanel } from "./panels/GeneralPanel";
import { ModelLibraryPanel } from "./panels/ModelLibraryPanel";
import { LLMPanel } from "./panels/LLMPanel";
import { ImageGenPanel } from "./panels/ImageGenPanel";
import { VideoGenPanel } from "./panels/VideoGenPanel";
import { TTSPanel } from "./panels/TTSPanel";
import { StoragePanel } from "./panels/StoragePanel";
import {
  Settings,
  Library,
  Bot,
  ImageIcon,
  Video,
  Volume2,
  HardDrive,
} from "lucide-react";

/**
 * 导航配置项
 *
 * 按分组组织:
 * - 通用: 偏好设置
 * - AI 服务: 模型库 / LLM / 图像 / 视频 / 语音
 * - 系统: 存储
 */
const NAV_ITEMS: SettingsNavItem[] = [
  { id: "general", label: "通用设置", icon: Settings, group: "通用" },
  { id: "library", label: "模型库", icon: Library, group: "AI 服务" },
  { id: "llm", label: "LLM 模型", icon: Bot, group: "AI 服务" },
  { id: "image", label: "图像生成", icon: ImageIcon, group: "AI 服务" },
  { id: "video", label: "视频生成", icon: Video, group: "AI 服务" },
  { id: "tts", label: "语音合成", icon: Volume2, group: "AI 服务" },
  { id: "storage", label: "存储与导出", icon: HardDrive, group: "系统" },
];

/**
 * 面板映射
 */
const PANEL_MAP: Record<string, React.ComponentType> = {
  general: GeneralPanel,
  library: ModelLibraryPanel,
  llm: LLMPanel,
  image: ImageGenPanel,
  video: VideoGenPanel,
  tts: TTSPanel,
  storage: StoragePanel,
};

/**
 * 设置页面 - 侧边栏导航架构
 *
 * 设计规范:
 * - macOS System Settings 风格
 * - 左侧分类导航 + 右侧配置详情
 * - 支持多种 AI 服务类型的独立配置
 * - Zen-iOS Hybrid 风格
 */
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const ActivePanel = PANEL_MAP[activeTab] ?? GeneralPanel;

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* 顶部标题栏 */}
      <header className="h-14 flex items-center px-8 shrink-0 border-b border-[var(--border)]">
        <h1 className="text-lg font-bold tracking-tight">设置</h1>
      </header>

      {/* 分栏布局 */}
      <SettingsLayout
        sidebar={
          <SettingsSidebar
            items={NAV_ITEMS}
            activeId={activeTab}
            onSelect={setActiveTab}
          />
        }
      >
        <ActivePanel />
      </SettingsLayout>
    </div>
  );
}
