import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  ScrollArea,
  Input,
} from "@/components/ui";
import { Film, Clock, Search, Plus, Filter } from "lucide-react";

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
  {
    id: "proj-004",
    name: "教程视频 - React入门",
    status: "draft",
    updatedAt: "2026-02-06 14:00",
    thumbnail: null,
    scenesCount: 20,
  },
  {
    id: "proj-005",
    name: "旅行记录 - 云南之旅",
    status: "completed",
    updatedAt: "2026-02-05 09:30",
    thumbnail: null,
    scenesCount: 25,
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
 * 项目库页面 - Zen-iOS Hybrid 风格
 */
export function ProjectsPage() {
  const navigate = useNavigate();

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor/${projectId}/script`);
  };

  const handleCreateProject = () => {
    const newProjectId = `proj-${Date.now()}`;
    navigate(`/editor/${newProjectId}/script`);
  };

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* 顶部标题栏 */}
      <header className="h-14 flex items-center justify-between px-8 shrink-0 border-b border-[var(--border)]">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            项目库
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              type="text"
              placeholder="搜索项目..."
              className="w-64 pl-11 h-9 rounded-lg"
            />
          </div>

          {/* 筛选按钮 */}
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" strokeWidth={2} />
            筛选
          </Button>

          {/* 新建项目 */}
          <Button size="sm" className="gap-2" onClick={handleCreateProject}>
            <Plus className="w-4 h-4" strokeWidth={2} />
            新建项目
          </Button>
        </div>
      </header>

      {/* 项目列表 */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-8">
          {mockProjects.length === 0 ? (
            <Card variant="inset" className="py-16">
              <div className="text-center text-[var(--muted-foreground)]">
                <Film className="w-16 h-16 mx-auto mb-6 opacity-30" strokeWidth={1.5} />
                <p className="text-lg font-medium">还没有项目</p>
                <p className="text-sm mt-2">点击右上角"新建项目"开始创作</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </div>
      </ScrollArea>
    </div>
  );
}
