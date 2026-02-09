import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  Input,
  LabelIndustrial,
  Button,
} from "@/components/ui";
import { Key, Folder, Palette, Info, Trash2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/theme";

/**
 * 设置页面 - Zen-iOS Hybrid 风格
 *
 * 设计规范:
 * - 毛玻璃卡片
 * - 凹陷输入框
 * - 大圆角和呼吸感间距
 * - 工业风格标签
 */
export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* 顶部标题栏 */}
      <header className="h-14 flex items-center px-8 shrink-0 border-b border-[var(--border)]">
        <div>
          <h1 className="text-lg font-bold tracking-tight">设置</h1>
        </div>
      </header>

      {/* 设置内容 */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-2xl mx-auto p-10 space-y-8">
          {/* API 配置 */}
          <section>
            <div className="mb-4">
              <LabelIndustrial>服务配置</LabelIndustrial>
              <h2 className="text-xl font-bold tracking-tight mt-2">API 密钥</h2>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[18px] bg-[var(--accent)]/10 flex items-center justify-center">
                    <Key className="w-7 h-7 text-[var(--accent)]" strokeWidth={2} />
                  </div>
                  <div>
                    <CardTitle>AI 服务配置</CardTitle>
                    <CardDescription>配置 AI 服务的 API 密钥以启用智能功能</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <LabelIndustrial>OpenAI API Key</LabelIndustrial>
                  <Input
                    type="password"
                    placeholder="sk-..."
                  />
                </div>
                <div className="space-y-2">
                  <LabelIndustrial>Stable Diffusion API</LabelIndustrial>
                  <Input
                    type="password"
                    placeholder="输入 API 密钥..."
                  />
                </div>
                <Button size="sm">保存配置</Button>
              </CardContent>
            </Card>
          </section>

          {/* 存储路径 */}
          <section>
            <div className="mb-4">
              <LabelIndustrial>本地存储</LabelIndustrial>
              <h2 className="text-xl font-bold tracking-tight mt-2">存储设置</h2>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[18px] bg-[var(--success)]/10 flex items-center justify-center">
                    <Folder className="w-7 h-7 text-[var(--success)]" strokeWidth={2} />
                  </div>
                  <div>
                    <CardTitle>存储路径</CardTitle>
                    <CardDescription>配置项目和缓存的存储位置</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <LabelIndustrial>项目存储路径</LabelIndustrial>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      readOnly
                      value="C:/Users/Administrator/Documents/DY-AutoWork"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      浏览
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <LabelIndustrial>缓存路径</LabelIndustrial>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      readOnly
                      value="C:/Users/Administrator/AppData/Local/DY-AutoWork/cache"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      浏览
                    </Button>
                  </div>
                </div>

                <Card variant="inset" className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-4 h-4 text-[var(--muted-foreground)]" strokeWidth={2} />
                      <div>
                        <span className="text-sm font-medium">缓存大小</span>
                        <p className="text-xs text-[var(--muted-foreground)]">清理后将重新生成</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">256 MB</span>
                      <Button variant="destructive" size="sm">
                        清理
                      </Button>
                    </div>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </section>

          {/* 外观 */}
          <section>
            <div className="mb-4">
              <LabelIndustrial>个性化</LabelIndustrial>
              <h2 className="text-xl font-bold tracking-tight mt-2">外观</h2>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[18px] bg-purple-500/10 flex items-center justify-center">
                    <Palette className="w-7 h-7 text-purple-500" strokeWidth={2} />
                  </div>
                  <div>
                    <CardTitle>主题</CardTitle>
                    <CardDescription>
                      当前模式：{theme === "light" ? "浅色模式" : "深色模式"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="sm"
                    variant={theme === "light" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="w-4 h-4" strokeWidth={2} />
                    浅色模式
                  </Button>
                  <Button
                    size="sm"
                    variant={theme === "dark" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="w-4 h-4" strokeWidth={2} />
                    深色模式
                  </Button>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  切换后立即生效，并自动保存为下次启动默认主题。
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 关于 */}
          <section>
            <div className="mb-4">
              <LabelIndustrial>信息</LabelIndustrial>
              <h2 className="text-xl font-bold tracking-tight mt-2">关于</h2>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[18px] bg-[var(--primary)] flex items-center justify-center shadow-[var(--shadow-button)]">
                    <Info className="w-7 h-7 text-[var(--primary-foreground)]" strokeWidth={2} />
                  </div>
                  <div>
                    <CardTitle>抖音 AI 视频工作台</CardTitle>
                    <CardDescription>从创意到成片的全流程工具</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Card variant="inset" className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">版本</span>
                    <span className="font-medium">0.1.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Tauri</span>
                    <span className="font-medium">2.x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">React</span>
                    <span className="font-medium">19.x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">设计系统</span>
                    <span className="font-medium">Zen-iOS Hybrid</span>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
