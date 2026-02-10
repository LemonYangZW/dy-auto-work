import { useState } from "react";
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
  Skeleton,
} from "@/components/ui";
import { Film, Clock, Search, Plus, Filter, Trash2 } from "lucide-react";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProjectQueries";

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "草稿", variant: "outline" },
  rendering: { label: "渲染中", variant: "secondary" },
  completed: { label: "已完成", variant: "default" },
  failed: { label: "失败", variant: "destructive" },
};

/**
 * 项目库页面 - Zen-iOS Hybrid 风格
 */
export function ProjectsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: projects = [], isLoading } = useProjects();
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor/${projectId}/script`);
  };

  const handleCreateProject = async () => {
    try {
      const project = await createMutation.mutateAsync({ name: "未命名项目" });
      navigate(`/editor/${project.id}/script`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm("确定要删除这个项目吗？此操作无法撤销。")) {
      await deleteMutation.mutateAsync(projectId);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
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
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              type="text"
              placeholder="搜索项目..."
              className="w-64 pl-11 h-9 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" strokeWidth={2} />
            筛选
          </Button>

          <Button size="sm" className="gap-2" onClick={handleCreateProject}>
            <Plus className="w-4 h-4" strokeWidth={2} />
            新建项目
          </Button>
        </div>
      </header>

      {/* 项目列表 */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-52 w-full rounded-[28px]" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card variant="inset" className="py-16">
              <div className="text-center text-[var(--muted-foreground)]">
                <Film className="w-16 h-16 mx-auto mb-6 opacity-30" strokeWidth={1.5} />
                <p className="text-lg font-medium">
                  {searchTerm ? "没有匹配的项目" : "还没有项目"}
                </p>
                <p className="text-sm mt-2">
                  {searchTerm ? "试试其他关键词" : "点击右上角\"新建项目\"开始创作"}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  variant="interactive"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <div className="aspect-video bg-gradient-to-br from-black/5 to-black/10 rounded-t-[27px] flex items-center justify-center overflow-hidden">
                    <Film className="w-12 h-12 text-[var(--muted-foreground)]/40" strokeWidth={1.5} />
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="line-clamp-1 text-base">
                        {project.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        aria-label="删除项目"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Badge variant={statusMap[project.status]?.variant || "outline"} className="w-fit mt-1">
                      {statusMap[project.status]?.label || project.status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                        {formatDate(project.updated_at)}
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
