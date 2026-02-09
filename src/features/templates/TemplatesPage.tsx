import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  ScrollArea,
  Input,
} from "@/components/ui";
import { LayoutGrid, Search, Film, Image, Mic, ShoppingBag, Utensils, Plane } from "lucide-react";

// Mock 模板数据
const mockTemplates = [
  {
    id: "tpl-001",
    name: "美食探店",
    description: "适合餐厅、小吃、咖啡厅等美食类内容",
    icon: Utensils,
    category: "生活",
    scenesCount: 6,
    isNew: true,
  },
  {
    id: "tpl-002",
    name: "产品开箱",
    description: "电子产品、美妆、服饰等开箱测评",
    icon: ShoppingBag,
    category: "电商",
    scenesCount: 8,
    isNew: false,
  },
  {
    id: "tpl-003",
    name: "旅行Vlog",
    description: "旅行记录、景点介绍、攻略分享",
    icon: Plane,
    category: "旅行",
    scenesCount: 10,
    isNew: true,
  },
  {
    id: "tpl-004",
    name: "口播解说",
    description: "知识科普、新闻解读、故事讲述",
    icon: Mic,
    category: "知识",
    scenesCount: 5,
    isNew: false,
  },
  {
    id: "tpl-005",
    name: "图文混剪",
    description: "图片轮播、照片墙、回忆录风格",
    icon: Image,
    category: "创意",
    scenesCount: 8,
    isNew: false,
  },
  {
    id: "tpl-006",
    name: "影视解说",
    description: "电影、电视剧、综艺节目解说",
    icon: Film,
    category: "娱乐",
    scenesCount: 12,
    isNew: false,
  },
];

const categories = ["全部", "生活", "电商", "旅行", "知识", "创意", "娱乐"];

/**
 * 模板库页面 - Zen-iOS Hybrid 风格
 */
export function TemplatesPage() {
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* 顶部标题栏 */}
      <header className="h-14 flex items-center justify-between px-8 shrink-0 border-b border-[var(--border)]">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            模板库
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              type="text"
              placeholder="搜索模板..."
              className="w-64 pl-11 h-9 rounded-lg"
            />
          </div>
        </div>
      </header>

      {/* 分类标签 */}
      <div className="px-8 py-4 border-b border-[var(--border)] flex gap-2 overflow-x-auto">
        {categories.map((category, index) => (
          <button
            key={category}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
              transition-colors duration-200
              ${index === 0
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 模板列表 */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-8">
          {mockTemplates.length === 0 ? (
            <Card variant="inset" className="py-16">
              <div className="text-center text-[var(--muted-foreground)]">
                <LayoutGrid className="w-16 h-16 mx-auto mb-6 opacity-30" strokeWidth={1.5} />
                <p className="text-lg font-medium">暂无模板</p>
                <p className="text-sm mt-2">模板库即将上线，敬请期待</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <Card
                    key={template.id}
                    variant="interactive"
                    className="relative"
                  >
                    {template.isNew && (
                      <Badge
                        variant="default"
                        className="absolute top-4 right-4 z-10"
                      >
                        新
                      </Badge>
                    )}

                    <CardHeader>
                      <div className="w-14 h-14 rounded-[18px] bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                        <IconComponent className="w-7 h-7 text-[var(--accent)]" strokeWidth={2} />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle>{template.name}</CardTitle>
                        <Badge variant="outline" className="text-[10px]">
                          {template.category}
                        </Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                      <p className="text-xs text-[var(--muted-foreground)] mt-3">
                        包含 {template.scenesCount} 个预设分镜
                      </p>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
