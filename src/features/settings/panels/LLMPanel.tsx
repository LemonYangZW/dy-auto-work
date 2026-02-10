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
  Switch,
  Separator,
} from "@/components/ui";
import { Bot, Sparkles, Cpu } from "lucide-react";

/**
 * LLM 模型配置面板
 *
 * 支持多个 LLM Provider:
 * - OpenAI (GPT-4o, GPT-4.1 等)
 * - Claude (Anthropic)
 * - DeepSeek
 * - Google (Gemini)
 * - 本地模型 (兼容 OpenAI API 的本地部署)
 *
 * 模型列表从 models.dev API 动态获取
 * defaultProvider 状态与 ProviderConfigCard 的 isDefault 动态联动
 */
export function LLMPanel() {
  const [defaultProvider, setDefaultProvider] = useState("openai");
  const [temperature, setTemperature] = useState(0.7);

  return (
    <>
      {/* 默认 Provider 选择 */}
      <SettingSection
        title="LLM 大语言模型"
        description="用于剧本生成和分镜拆解的 AI 模型配置"
      >
        <div className="flex items-center justify-between">
          <div>
            <LabelIndustrial>默认 LLM 服务</LabelIndustrial>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              选择用于生成内容的默认模型服务
            </p>
          </div>
          <Select value={defaultProvider} onValueChange={setDefaultProvider}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="deepseek">DeepSeek</SelectItem>
              <SelectItem value="local">本地模型</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingSection>

      <Separator />

      {/* OpenAI 配置 */}
      <ProviderConfigCard
        id="openai"
        title="OpenAI"
        icon={<Bot className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="GPT-5.2, GPT-5.3 Codex 系列模型"
        isDefault={defaultProvider === "openai"}
        isConfigured
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="sk-..." />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>Base URL</LabelIndustrial>
          <Input
            type="text"
            placeholder="https://api.openai.com/v1"
            defaultValue="https://api.openai.com/v1"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            自定义 API 端点，可用于代理或兼容服务
          </p>
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认模型</LabelIndustrial>
          <ModelSelect
            providerId="openai"
            category="llm"
            defaultValue="gpt-5.2"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <LabelIndustrial>Temperature</LabelIndustrial>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              {temperature.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[temperature]}
            onValueChange={([v]) => setTemperature(v)}
            min={0}
            max={2}
            step={0.1}
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            值越高创意性越强，值越低结果越稳定
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <LabelIndustrial>流式输出</LabelIndustrial>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              启用实时流式响应
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </ProviderConfigCard>

      {/* Anthropic Claude 配置 */}
      <ProviderConfigCard
        id="anthropic"
        title="Anthropic"
        icon={<Sparkles className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="Claude Opus 4.6, Sonnet 4.5, Haiku 4.5 系列模型"
        isDefault={defaultProvider === "anthropic"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="sk-ant-..." />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认模型</LabelIndustrial>
          <ModelSelect
            providerId="anthropic"
            category="llm"
            defaultValue="claude-sonnet-4-5-20250929"
          />
        </div>
      </ProviderConfigCard>

      {/* Google Gemini 配置 */}
      <ProviderConfigCard
        id="google"
        title="Google"
        icon={<Sparkles className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="Gemini 3 Pro, Flash 系列模型"
        isDefault={defaultProvider === "google"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="输入 Google AI API Key..." />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认模型</LabelIndustrial>
          <ModelSelect
            providerId="google"
            category="llm"
          />
        </div>
      </ProviderConfigCard>

      {/* DeepSeek 配置 */}
      <ProviderConfigCard
        id="deepseek"
        title="DeepSeek"
        icon={<Bot className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="DeepSeek Chat / Reasoner 模型"
        isDefault={defaultProvider === "deepseek"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API Key</LabelIndustrial>
          <Input type="password" placeholder="输入 DeepSeek API Key..." />
        </div>
        <div className="space-y-2">
          <LabelIndustrial>默认模型</LabelIndustrial>
          <ModelSelect
            providerId="deepseek"
            category="llm"
            defaultValue="deepseek-chat"
          />
        </div>
      </ProviderConfigCard>

      {/* 本地模型配置 */}
      <ProviderConfigCard
        id="local"
        title="本地模型"
        icon={<Cpu className="w-4 h-4 text-[var(--muted-foreground)]" />}
        description="兼容 OpenAI API 的本地部署模型"
        isDefault={defaultProvider === "local"}
        isConfigured={false}
      >
        <div className="space-y-2">
          <LabelIndustrial>API 端点地址</LabelIndustrial>
          <Input
            type="text"
            placeholder="http://localhost:11434/v1"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            支持 Ollama、LM Studio 等兼容 OpenAI API 格式的本地服务
          </p>
        </div>
        <div className="space-y-2">
          <LabelIndustrial>模型名称</LabelIndustrial>
          <Input type="text" placeholder="llama3.1, qwen2.5 等" />
        </div>
      </ProviderConfigCard>
    </>
  );
}
