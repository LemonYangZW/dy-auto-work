import { SettingSection } from "../components/SettingSection";
import {
  Card,
  Input,
  LabelIndustrial,
  Button,
  Separator,
} from "@/components/ui";
import { Trash2 } from "lucide-react";

/**
 * 存储与导出配置面板
 *
 * 迁移自原 SettingsPage 的存储 Tab
 * 包含: 项目存储路径、缓存路径、缓存清理
 */
export function StoragePanel() {
  return (
    <>
      <SettingSection
        title="存储路径"
        description="配置项目和缓存的存储位置"
      >
        <Card variant="solid" className="p-5 space-y-5">
          {/* 项目存储路径 */}
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

          <Separator />

          {/* 缓存路径 */}
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
        </Card>
      </SettingSection>

      <Separator />

      <SettingSection title="缓存管理" description="清理临时文件以释放磁盘空间">
        <Card variant="solid" className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2
                className="w-4 h-4 text-[var(--muted-foreground)]"
                strokeWidth={2}
              />
              <div>
                <span className="text-sm font-medium">缓存大小</span>
                <p className="text-xs text-[var(--muted-foreground)]">
                  清理后将重新生成
                </p>
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
      </SettingSection>
    </>
  );
}
