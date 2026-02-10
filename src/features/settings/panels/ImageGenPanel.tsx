import { useState } from "react";
import { SettingSection } from "../components/SettingSection";
import { ProviderConfigCard } from "../components/ProviderConfigCard";
import { ModelSelect } from "../components/ModelSelect";
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
import { Palette, ImageIcon, Layers } from "lucide-react";

/**
 * 图像生成配置面板
 *
 * 支持:
 * - OpenAI (DALL-E 系列) - models.dev 动态获取
 * - Google (Imagen) - models.dev 动态获取
 * - 即梦 (Jimeng) - 字节跳动 AI 图像生成 (手动配置)
 * - Stable Diffusion - 开源图像生成 (手动配置)
 * - NanoBanana Pro - AI 图像/视频生成 (手动配置)
 *
 * defaultProvider 状态与 ProviderConfigCard 的 isDefault 动态联动
 */
export function ImageGenPanel() {
  const [defaultProvider, setDefaultProvider] = useState("openai");

  return (
    <>
      {/* 默认 Provider 选择 */}
      <SettingSection
        title="图像生成"
        description="用于分镜图像和素材生成的 AI 服务配置"
      >
        <div className="flex items-center justify-between">
          <div>
            <LabelIndustrial>默认图像生成服务</LabelIndustrial>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              选择用于生成分镜图像的默认服务
            </p>
          </div>
          <Select value={defaultProvider} onValueChange={setDefaultProvider}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI (DALL-E)</SelectItem>
              <SelectItem value="google">Google (Imagen)</SelectItem>
              <SelectItem value="jimeng">即梦 (Jimeng)</SelectItem>
              <SelectItem value="sd">Stable Diffusion</SelectItem>
              <SelectItem value="nanobanana">NanoBanana Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingSection>

      <Separator />

      {/* OpenAI DALL-E 配置 */}
      <ProviderConfigCard
        id="openai-img"
        title="OpenAI (DALL-E)"
        icon={<ImageIcon className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="DALL-E 系列图像生成模型"
        isDefault={defaultProvider === "openai"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="sk-..." />
          <p className="text-xs text-[var(--muted-foreground)]">
            与 LLM 配置共享 OpenAI API Key（也可单独设置）
          </p>
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认模型</LabelIndustrial>
          <ModelSelect
            providerId="openai"
            category="image"
            showDetails={false}
          />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认图像尺寸</LabelIndustrial>
          <Select defaultValue="1024x1024">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1024x1024">1024 × 1024</SelectItem>
              <SelectItem value="1024x1792">1024 × 1792 (竖版)</SelectItem>
              <SelectItem value="1792x1024">1792 × 1024 (横版)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ProviderConfigCard>

      {/* Google Imagen 配置 */}
      <ProviderConfigCard
        id="google-img"
        title="Google (Imagen)"
        icon={<ImageIcon className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="Google Imagen 图像生成模型"
        isDefault={defaultProvider === "google"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="输入 Google AI API Key..." />
          <p className="text-xs text-[var(--muted-foreground)]">
            与 LLM 配置共享 Google API Key（也可单独设置）
          </p>
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认模型</LabelIndustrial>
          <ModelSelect
            providerId="google"
            category="image"
            showDetails={false}
          />
        </div>
      </ProviderConfigCard>

      {/* 即梦配置 */}
      <ProviderConfigCard
        id="jimeng"
        title="即梦 (Jimeng)"
        icon={<Palette className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="字节跳动 AI 图像生成服务"
        isDefault={defaultProvider === "jimeng"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="输入即梦 API Key..." />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认图像尺寸</LabelIndustrial>
          <Select defaultValue="1024x1024">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="512x512">512 × 512</SelectItem>
              <SelectItem value="1024x1024">1024 × 1024</SelectItem>
              <SelectItem value="1024x1792">1024 × 1792 (竖版)</SelectItem>
              <SelectItem value="1792x1024">1792 × 1024 (横版)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ProviderConfigCard>

      {/* Stable Diffusion 配置 */}
      <ProviderConfigCard
        id="sd"
        title="Stable Diffusion"
        icon={<ImageIcon className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="开源图像生成模型（API 或本地部署）"
        isDefault={defaultProvider === "sd"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="输入 Stability AI API Key..." />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>服务地址</LabelIndustrial>
          <Input
            type="text"
            placeholder="https://api.stability.ai 或本地地址"
            defaultValue="https://api.stability.ai"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            支持 Stability AI 官方 API 或本地 WebUI 部署
          </p>
        </div>
      </ProviderConfigCard>

      {/* NanoBanana Pro 配置 */}
      <ProviderConfigCard
        id="nanobanana-img"
        title="NanoBanana Pro"
        icon={<Layers className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="NanoBanana AI 图像生成服务"
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
