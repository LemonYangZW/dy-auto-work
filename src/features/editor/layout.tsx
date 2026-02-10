import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { Group, Panel, Separator as PanelSeparator } from "react-resizable-panels";
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Separator,
  Textarea,
  LabelIndustrial,
  Card,
} from "@/components/ui";
import {
  ArrowLeft,
  FileText,
  LayoutGrid,
  Film,
  Save,
  Undo,
  Redo,
  Play,
  Download,
  FolderOpen,
  Image,
  Music,
  Type,
  Sparkles,
  Wand2,
  ChevronRight,
} from "lucide-react";

/**
 * 编辑器主布局 - Zen-iOS Hybrid 风格
 *
 * 设计规范:
 * - 毛玻璃侧边栏
 * - 层级堆叠效果
 * - 大圆角和呼吸感间距
 * - 触觉反馈按钮
 */
export function EditorLayout() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();

  // 根据当前路径确定激活的 tab
  const getActiveTab = () => {
    if (location.pathname.includes("/script")) return "script";
    if (location.pathname.includes("/storyboard")) return "storyboard";
    if (location.pathname.includes("/video")) return "video";
    return "script";
  };

  const handleTabChange = (value: string) => {
    navigate(`/editor/${projectId}/${value}`);
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--background)]">
      {/* 顶部工具栏 - 毛玻璃效果 */}
      <header className="h-14 flex items-center justify-between px-5 shrink-0 glass border-b-0">
        {/* 左侧：返回 + 项目名 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </Button>

          <div className="h-6 w-px bg-black/10" />

          <div>
            <span className="text-sm font-semibold text-[var(--foreground)]">未命名项目</span>
            <span className="ml-2 text-xs text-[var(--muted-foreground)]">草稿</span>
          </div>
        </div>

        {/* 中间：模式切换 - 毛玻璃分段控制器 */}
        <div className="glass rounded-full p-1">
          <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
            <TabsList className="bg-transparent gap-1">
              <TabsTrigger
                value="script"
                className="gap-2 rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <FileText className="w-4 h-4" strokeWidth={2} />
                剧本
              </TabsTrigger>
              <TabsTrigger
                value="storyboard"
                className="gap-2 rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <LayoutGrid className="w-4 h-4" strokeWidth={2} />
                分镜
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="gap-2 rounded-full px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Film className="w-4 h-4" strokeWidth={2} />
                视频
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" title="撤销">
            <Undo className="w-4 h-4" strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="icon-sm" title="重做">
            <Redo className="w-4 h-4" strokeWidth={2} />
          </Button>

          <div className="h-6 w-px bg-black/10 mx-1" />

          <Button variant="ghost" size="icon-sm" title="预览">
            <Play className="w-4 h-4" strokeWidth={2} />
          </Button>
          <Button variant="secondary" size="icon-sm" title="保存">
            <Save className="w-4 h-4" strokeWidth={2} />
          </Button>

          <Button size="sm" className="gap-2 ml-2">
            <Download className="w-4 h-4" strokeWidth={2} />
            导出
          </Button>
        </div>
      </header>

      {/* 主内容区 - 三栏布局 */}
      <main className="flex-1 overflow-hidden p-2">
        <Group
          orientation="horizontal"
          id="editor-layout-v2"
          className="h-full"
          defaultLayout={{ "editor-left": 18, "editor-main": 60, "editor-right": 22 }}
        >
          {/* 左侧面板 - 资源库 */}
          <Panel id="editor-left" defaultSize={18} minSize={12}>
            <LeftSidebar />
          </Panel>

          {/* 拖拽分隔条 */}
          <PanelSeparator className="w-1.5 rounded-full bg-black/[0.08] hover:bg-black/20 active:bg-black/30 transition-colors" />

          {/* 中间工作区 */}
          <Panel id="editor-main" defaultSize={60} minSize={30}>
            <Card variant="solid" className="h-full overflow-hidden">
              <Outlet />
            </Card>
          </Panel>

          {/* 拖拽分隔条 */}
          <PanelSeparator className="w-1.5 rounded-full bg-black/[0.08] hover:bg-black/20 active:bg-black/30 transition-colors" />

          {/* 右侧面板 - 属性/AI */}
          <Panel id="editor-right" defaultSize={22} minSize={15}>
            <RightSidebar />
          </Panel>
        </Group>
      </main>
    </div>
  );
}

/**
 * 左侧边栏 - 资源库 (毛玻璃风格)
 */
function LeftSidebar() {
  return (
    <Card variant="default" className="h-full flex flex-col overflow-hidden">
      {/* 标签页切换 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1 justify-start gap-2">
            <FolderOpen className="w-4 h-4" strokeWidth={2} />
            项目
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2">
            <Image className="w-4 h-4" strokeWidth={2} />
            素材
          </Button>
        </div>
      </div>

      {/* 资源列表 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 场景列表 */}
          <div>
            <LabelIndustrial className="px-2 mb-3 block">场景大纲</LabelIndustrial>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`p-3 rounded-[14px] cursor-pointer transition-all duration-150 ${
                    i === 1
                      ? "bg-white shadow-sm border border-white/60"
                      : "hover:bg-black/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">场景 {i}</span>
                    <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" strokeWidth={2} />
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-1">
                    这是场景 {i} 的描述文字...
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-black/5" />

          {/* 素材分类 */}
          <div>
            <LabelIndustrial className="px-2 mb-3 block">素材库</LabelIndustrial>
            <div className="space-y-1">
              <ResourceItem
                icon={<Image className="w-4 h-4 text-[var(--accent)]" strokeWidth={2} />}
                label="图片素材"
                count={12}
              />
              <ResourceItem
                icon={<Music className="w-4 h-4 text-[var(--success)]" strokeWidth={2} />}
                label="音频素材"
                count={3}
              />
              <ResourceItem
                icon={<Type className="w-4 h-4 text-[var(--muted-foreground)]" strokeWidth={2} />}
                label="字幕文件"
                count={1}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}

/**
 * 资源项组件
 */
function ResourceItem({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="p-3 rounded-[14px] hover:bg-black/5 cursor-pointer text-sm flex items-center gap-3 transition-colors">
      {icon}
      <span className="flex-1">{label}</span>
      <span className="text-xs text-[var(--muted-foreground)] bg-black/5 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

/**
 * 右侧边栏 - AI 控制 & 属性 (毛玻璃风格)
 */
function RightSidebar() {
  return (
    <Card variant="default" className="h-full flex flex-col overflow-hidden">
      {/* 标题 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[var(--accent)] to-[var(--success)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-bold">AI 助手</h2>
            <p className="text-[10px] text-[var(--muted-foreground)]">智能创作辅助</p>
          </div>
        </div>
      </div>

      {/* AI 控制区 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* AI 生成区域 */}
          <div className="space-y-3">
            <LabelIndustrial>AI 提示词</LabelIndustrial>
            <Textarea
              placeholder="描述你想要生成的内容..."
              className="min-h-[100px]"
            />
            <Button className="w-full gap-2">
              <Wand2 className="w-4 h-4" strokeWidth={2} />
              生成内容
            </Button>
          </div>

          <Separator className="bg-black/5" />

          {/* 属性面板 */}
          <div className="space-y-3">
            <LabelIndustrial>属性</LabelIndustrial>
            <Card variant="inset" className="p-4 space-y-3">
              <PropertyRow label="时长" value="3.0 秒" />
              <PropertyRow label="分辨率" value="1080 × 1920" />
              <PropertyRow label="帧率" value="30 fps" />
            </Card>
          </div>

          <Separator className="bg-black/5" />

          {/* 导出设置预览 */}
          <div className="space-y-3">
            <LabelIndustrial>导出预设</LabelIndustrial>
            <Card variant="interactive" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">抖音竖屏</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    1080×1920 · 30fps · H.264
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" strokeWidth={2} />
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}

/**
 * 属性行组件
 */
function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
