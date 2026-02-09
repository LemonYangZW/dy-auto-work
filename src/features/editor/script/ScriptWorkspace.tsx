import { Button, ScrollArea, Textarea } from "@/components/ui";
import { Wand2, Bold, Italic, List, AlignLeft, Sparkles, Type, Heading1, Heading2 } from "lucide-react";

/**
 * 剧本工作区 - Zen-iOS Hybrid 风格
 *
 * 设计规范:
 * - Notion 风格富文本编辑器
 * - 毛玻璃工具栏
 * - 凹陷编辑区域
 * - 呼吸感排版
 */
export function ScriptWorkspace() {
  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 - 毛玻璃风格 */}
      <div className="h-12 border-b border-black/5 flex items-center px-6 gap-1 shrink-0">
        <ToolbarButton icon={<Bold />} />
        <ToolbarButton icon={<Italic />} />
        <div className="w-px h-5 bg-black/10 mx-2" />
        <ToolbarButton icon={<Heading1 />} />
        <ToolbarButton icon={<Heading2 />} />
        <div className="w-px h-5 bg-black/10 mx-2" />
        <ToolbarButton icon={<List />} />
        <ToolbarButton icon={<AlignLeft />} />
        <div className="w-px h-5 bg-black/10 mx-2" />

        <Button variant="default" size="sm" className="gap-2 ml-auto">
          <Wand2 className="w-4 h-4" strokeWidth={2} />
          AI 扩写
        </Button>
        <Button variant="secondary" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" strokeWidth={2} />
          生成分镜
        </Button>
      </div>

      {/* 编辑区 */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-10">
          {/* 标题输入 */}
          <input
            type="text"
            placeholder="输入视频标题..."
            className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-8 placeholder:text-[var(--muted-foreground)]/40 tracking-tight"
            defaultValue="美食探店 - 火锅篇"
          />

          {/* 内容编辑区 - 模拟 Notion 块 */}
          <div className="space-y-6">
            <ContentBlock
              title="场景一：开场"
              content="镜头从店面外观缓缓推进，展示热气腾腾的招牌。背景音乐轻快，配合城市夜景氛围。"
              index={1}
            />
            <ContentBlock
              title="场景二：店内环境"
              content="展示店内装修风格，突出特色元素。采访店员或老板，介绍店铺历史。"
              index={2}
            />
            <ContentBlock
              title="场景三：菜品展示"
              content="特写镜头展示招牌菜品，强调食材新鲜。加入沸腾的锅底画面，增强食欲感。"
              index={3}
            />

            {/* 添加新块提示 */}
            <div className="p-4 rounded-[16px] border-2 border-dashed border-black/10 text-center text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer">
              <Type className="w-5 h-5 mx-auto mb-2" strokeWidth={2} />
              <p className="text-sm">点击添加新场景</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* 底部状态栏 */}
      <div className="h-10 border-t border-black/5 flex items-center justify-between px-6 text-xs text-[var(--muted-foreground)] shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            已自动保存
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>3 个场景</span>
          <span>·</span>
          <span>约 156 字</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 工具栏按钮
 */
function ToolbarButton({ icon }: { icon: React.ReactNode }) {
  return (
    <Button variant="ghost" size="icon-sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
      <span className="[&>svg]:w-4 [&>svg]:h-4 [&>svg]:stroke-[2]">{icon}</span>
    </Button>
  );
}

/**
 * 内容块组件
 */
function ContentBlock({
  title,
  content,
  index,
}: {
  title: string;
  content: string;
  index: number;
}) {
  return (
    <div className="group relative">
      {/* 场景序号 */}
      <div className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-sm font-semibold text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
        {index}
      </div>

      <div className="p-6 rounded-[20px] bg-white/50 hover:bg-white/70 border border-transparent hover:border-white/60 hover:shadow-sm transition-all">
        <input
          type="text"
          defaultValue={title}
          className="w-full text-lg font-bold bg-transparent border-none outline-none mb-3 placeholder:text-[var(--muted-foreground)]/40"
        />
        <Textarea
          defaultValue={content}
          className="min-h-[60px] text-[var(--muted-foreground)] leading-relaxed resize-none bg-transparent border-none"
        />
      </div>
    </div>
  );
}
