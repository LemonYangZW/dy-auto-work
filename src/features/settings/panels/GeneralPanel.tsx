import { SettingSection } from "../components/SettingSection";
import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  LabelIndustrial,
  Separator,
} from "@/components/ui";
import { useTheme, type ThemeMode } from "@/app/theme";

/**
 * 通用偏好设置面板
 *
 * 包含: 主题切换、语言选择等全局偏好
 */
export function GeneralPanel() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <SettingSection title="外观" description="自定义应用的视觉风格">
        <Card variant="solid" className="p-5 space-y-5">
          {/* 主题选择 */}
          <div className="flex items-center justify-between">
            <div>
              <LabelIndustrial>主题模式</LabelIndustrial>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                选择应用的颜色主题
              </p>
            </div>
            <Select
              value={theme}
              onValueChange={(v) => setTheme(v as ThemeMode)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">浅色</SelectItem>
                <SelectItem value="dark">深色</SelectItem>
                <SelectItem value="system">跟随系统</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </SettingSection>

      <Separator />

      <SettingSection title="行为" description="应用行为相关设置">
        <Card variant="solid" className="p-5 space-y-5">
          {/* 自动保存 */}
          <div className="flex items-center justify-between">
            <div>
              <LabelIndustrial>自动保存</LabelIndustrial>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                编辑内容时自动保存更改
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          {/* 启动页 */}
          <div className="flex items-center justify-between">
            <div>
              <LabelIndustrial>启动时打开上次项目</LabelIndustrial>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                启动应用时自动恢复上次编辑的项目
              </p>
            </div>
            <Switch />
          </div>
        </Card>
      </SettingSection>
    </>
  );
}
