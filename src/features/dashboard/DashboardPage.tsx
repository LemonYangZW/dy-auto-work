import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  ScrollArea,
  Input,
} from "@/components/ui";
import { Plus, Film, Clock, Search, FolderOpen } from "lucide-react";

// Mock 数据 - 后续会从 SQLite 读取
const mockProjects = [
  {
    id: "proj-001",
    name: "美食探店 - 火锅篇",
    status: "draft",
    updatedAt: "2026-02-09 10:30",
    thumbnail: null,
    scenesCount: 8,
  },
  {
    id: "proj-002",
    name: "产品开箱 - 新款手机",
    status: "rendering",
    updatedAt: "2026-02-08 15:20",
    thumbnail: null,
    scenesCount: 12,
  },
  {
    id: "proj-003",
    name: "日常Vlog - 周末游玩",
    status: "completed",
    updatedAt: "2026-02-07 20:15",
    thumbnail: null,
    scenesCount: 15,
  },
];

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "草稿", variant: "outline" },
  rendering: { label: "渲染中", variant: "secondary" },
  completed: { label: "已完成", variant: "default" },
};

/**
 * Dashboard 首页 - Zen-iOS Hybrid 风格
 *
 * 设计规范:
 * - 层级堆叠效果
 * - 呼吸感排版: p-6/p-8 大间距
 * - 毛玻璃卡片材质
 * - 工业风格标签
 */
export function DashboardPage() {
  const navigate = useNavigate();

  const handleCreateProject = () => {
    // TODO: 创建新项目并跳转
    const newProjectId = `proj-${Date.now()}`;
    navigate(`/editor/${newProjectId}/script`);
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor/${projectId}/script`);
  };

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* 顶部搜索栏 */}
      <header className="h-14 flex items-center justify-between px-8 shrink-0 border-b border-[var(--border)]">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            首页
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* 搜索框 - 凹陷质感 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              type="text"
              placeholder="搜索项目..."
              className="w-72 pl-11 h-9 rounded-lg"
            />
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-10 max-w-6xl mx-auto">
            {/* 快速操作区域 */}
            <section className="mb-12">
              <div className="mb-6">
                <span className="label-industrial">快速开始</span>
                <h2 className="text-2xl font-bold tracking-tight mt-2">创建新项目</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 新建项目卡片 - 交互式 */}
                <Card
                  variant="interactive"
                  onClick={handleCreateProject}
                >
                  <CardHeader>
                    <div className="w-14 h-14 rounded-[18px] bg-[var(--primary)] flex items-center justify-center mb-4 shadow-[var(--shadow-button)]">
                      <Plus className="w-7 h-7 text-[var(--primary-foreground)]" strokeWidth={2} />
                    </div>
                    <CardTitle>新建项目</CardTitle>
                    <CardDescription>从零开始创作新视频</CardDescription>
                  </CardHeader>
                </Card>

                {/* 模板创建 - 禁用状态 */}
                <Card variant="default" className="opacity-60 cursor-not-allowed">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-[18px] bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                      <FolderOpen className="w-7 h-7 text-[var(--accent)]" strokeWidth={2} />
                    </div>
                    <CardTitle>从模板创建</CardTitle>
                    <CardDescription>使用预设模板快速开始</CardDescription>
                    <Badge variant="secondary" className="mt-3 w-fit">即将推出</Badge>
                  </CardHeader>
                </Card>

                {/* 导入项目 - 禁用状态 */}
                <Card variant="default" className="opacity-60 cursor-not-allowed">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-[18px] bg-black/5 flex items-center justify-center mb-4">
                      <Film className="w-7 h-7 text-[var(--muted-foreground)]" strokeWidth={2} />
                    </div>
                    <CardTitle>导入项目</CardTitle>
                    <CardDescription>导入已有项目文件</CardDescription>
                    <Badge variant="secondary" className="mt-3 w-fit">即将推出</Badge>
                  </CardHeader>
                </Card>
              </div>
            </section>

            {/* 最近项目区域 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="label-industrial">项目库</span>
                  <h2 className="text-2xl font-bold tracking-tight mt-2">最近项目</h2>
                </div>
                <Button variant="ghost" size="sm">
                  查看全部
                </Button>
              </div>

              {mockProjects.length === 0 ? (
                <Card variant="inset" className="py-16">
                  <div className="text-center text-[var(--muted-foreground)]">
                    <Film className="w-16 h-16 mx-auto mb-6 opacity-30" strokeWidth={1.5} />
                    <p className="text-lg font-medium">还没有项目</p>
                    <p className="text-sm mt-2">点击上方"新建项目"开始创作</p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockProjects.map((project) => (
                    <Card
                      key={project.id}
                      variant="interactive"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      {/* 缩略图区域 */}
                      <div className="aspect-video bg-gradient-to-br from-black/5 to-black/10 rounded-t-[27px] flex items-center justify-center overflow-hidden">
                        <Film className="w-12 h-12 text-[var(--muted-foreground)]/40" strokeWidth={1.5} />
                      </div>

                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="line-clamp-1 text-base">
                            {project.name}
                          </CardTitle>
                          <Badge variant={statusMap[project.status]?.variant || "outline"}>
                            {statusMap[project.status]?.label || project.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                            {project.updatedAt}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Film className="w-3.5 h-3.5" strokeWidth={2} />
                            {project.scenesCount} 个分镜
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
