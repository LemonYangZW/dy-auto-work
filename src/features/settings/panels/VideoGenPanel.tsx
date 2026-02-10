import { useState } from "react";
import { SettingSection } from "../components/SettingSection";
import { ProviderConfigCard } from "../components/ProviderConfigCard";
import {
  Input,
  LabelIndustrial,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@/components/ui";
import { Video, Layers } from "lucide-react";

/**
 * 视频生成配置面板
 *
 * 支持:
 * - Veo 3.1 (Google) - AI 视频生成
 * - NanoBanana Pro - AI 视频生成
 *
 * defaultProvider 状态与 ProviderConfigCard 的 isDefault 动态联动
 */
export function VideoGenPanel() {
  const [defaultProvider, setDefaultProvider] = useState("veo");

  return (
    <>
      {/* 默认 Provider 选择 */}
      <SettingSection
        title="视频生成"
        description="用于 AI 视频素材生成的服务配置"
      >
        <div className="flex items-center justify-between">
          <div>
            <LabelIndustrial>默认视频生成服务</LabelIndustrial>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              选择用于生成视频片段的默认服务
            </p>
          </div>
          <Select value={defaultProvider} onValueChange={setDefaultProvider}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="veo">Veo 3.1</SelectItem>
              <SelectItem value="nanobanana">NanoBanana Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingSection>

      <Separator />

      {/* Veo 3.1 配置 */}
      <ProviderConfigCard
        id="veo"
        title="Veo 3.1"
        icon={<Video className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="Google AI 视频生成服务"
        isDefault={defaultProvider === "veo"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="输入 Google AI API Key..." />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认分辨率</LabelIndustrial>
          <Select defaultValue="1080p">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="720p">720p (1280×720)</SelectItem>
              <SelectItem value="1080p">1080p (1920×1080)</SelectItem>
              <SelectItem value="1080x1920">1080×1920 (竖版)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认时长</LabelIndustrial>
          <Select defaultValue="5">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 秒</SelectItem>
              <SelectItem value="5">5 秒</SelectItem>
              <SelectItem value="8">8 秒</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ProviderConfigCard>

      {/* NanoBanana Pro 视频配置 */}
      <ProviderConfigCard
        id="nanobanana-vid"
        title="NanoBanana Pro"
        icon={<Layers className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="NanoBanana AI 视频生成服务"
        isDefault={defaultProvider === "nanobanana"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="输入 NanoBanana API Key..." />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>API 端点</LabelIndustrial>
          <Input type="text" placeholder="https://api.nanobanana.com" />
        </div>
      </ProviderConfigCard>
    </>
  );
}
