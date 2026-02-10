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
  Slider,
  Separator,
} from "@/components/ui";
import { Volume2 } from "lucide-react";

/**
 * 语音合成 (TTS) 配置面板
 *
 * 支持 TTS 服务配置:
 * - OpenAI TTS - 高质量语音合成 (模型列表从 models.dev 动态获取)
 * - Google TTS - Google AI 语音合成 (模型列表从 models.dev 动态获取)
 * - Edge TTS - Microsoft Edge 免费语音合成 (手动配置)
 *
 * defaultProvider 状态与 ProviderConfigCard 的 isDefault 动态联动
 */
export function TTSPanel() {
  const [defaultProvider, setDefaultProvider] = useState("openai-tts");
  const [openaiSpeed, setOpenaiSpeed] = useState(1.0);
  const [edgeRate, setEdgeRate] = useState(0);
  const [edgeVolume, setEdgeVolume] = useState(0);

  return (
    <>
      {/* 默认 Provider 选择 */}
      <SettingSection
        title="语音合成 (TTS)"
        description="用于视频配音和旁白生成的语音合成服务"
      >
        <div className="flex items-center justify-between">
          <div>
            <LabelIndustrial>默认 TTS 服务</LabelIndustrial>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              选择用于语音合成的默认服务
            </p>
          </div>
          <Select value={defaultProvider} onValueChange={setDefaultProvider}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai-tts">OpenAI TTS</SelectItem>
              <SelectItem value="google-tts">Google TTS</SelectItem>
              <SelectItem value="edge-tts">Edge TTS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingSection>

      <Separator />

      {/* OpenAI TTS 配置 */}
      <ProviderConfigCard
        id="openai-tts"
        title="OpenAI TTS"
        icon={<Volume2 className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="OpenAI 高质量语音合成服务"
        isDefault={defaultProvider === "openai-tts"}
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
          <LabelIndustrial>TTS 模型</LabelIndustrial>
          <ModelSelect
            providerId="openai"
            category="tts"
            showDetails={false}
          />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认音色</LabelIndustrial>
          <Select defaultValue="alloy">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alloy">Alloy（中性）</SelectItem>
              <SelectItem value="echo">Echo（男声）</SelectItem>
              <SelectItem value="fable">Fable（英式）</SelectItem>
              <SelectItem value="onyx">Onyx（低沉）</SelectItem>
              <SelectItem value="nova">Nova（女声）</SelectItem>
              <SelectItem value="shimmer">Shimmer（温暖）</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LabelIndustrial>语速</LabelIndustrial>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              {openaiSpeed.toFixed(2)}x
            </span>
          </div>
          <Slider
            value={[openaiSpeed]}
            onValueChange={([v]) => setOpenaiSpeed(v)}
            min={0.25}
            max={4.0}
            step={0.25}
          />
        </div>
      </ProviderConfigCard>

      {/* Google TTS 配置 */}
      <ProviderConfigCard
        id="google-tts"
        title="Google TTS"
        icon={<Volume2 className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="Google AI 语音合成服务"
        isDefault={defaultProvider === "google-tts"}
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
          <LabelIndustrial>TTS 模型</LabelIndustrial>
          <ModelSelect
            providerId="google"
            category="tts"
            showDetails={false}
          />
        </div>
      </ProviderConfigCard>

      {/* Edge TTS 配置 */}
      <ProviderConfigCard
        id="edge-tts"
        title="Edge TTS"
        icon={<Volume2 className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="Microsoft Edge 免费语音合成"
        isDefault={defaultProvider === "edge-tts"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>默认语音</LabelIndustrial>
          <Select defaultValue="zh-CN-XiaoxiaoNeural">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh-CN-XiaoxiaoNeural">
                晓晓（女声，普通话）
              </SelectItem>
              <SelectItem value="zh-CN-YunxiNeural">
                云希（男声，普通话）
              </SelectItem>
              <SelectItem value="zh-CN-YunjianNeural">
                云健（男声，新闻）
              </SelectItem>
              <SelectItem value="zh-CN-XiaoyiNeural">
                晓伊（女声，温柔）
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LabelIndustrial>语速调整</LabelIndustrial>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              {edgeRate > 0 ? "+" : ""}{edgeRate}%
            </span>
          </div>
          <Slider
            value={[edgeRate]}
            onValueChange={([v]) => setEdgeRate(v)}
            min={-50}
            max={50}
            step={5}
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            -50% ~ +50% 调整默认语速
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LabelIndustrial>音量调整</LabelIndustrial>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              {edgeVolume > 0 ? "+" : ""}{edgeVolume}%
            </span>
          </div>
          <Slider
            value={[edgeVolume]}
            onValueChange={([v]) => setEdgeVolume(v)}
            min={-50}
            max={50}
            step={5}
          />
        </div>
      </ProviderConfigCard>
    </>
  );
}
