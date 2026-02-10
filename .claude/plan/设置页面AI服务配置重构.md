# 设置页面 AI 服务配置重构计划

> **任务**: 重构设置页面，采用侧边栏导航架构支持多种 AI 服务配置
> **方案**: 垂直侧边栏导航（macOS 系统设置风格）
> **状态**: 待批准

---

## 一、目标

将当前简单的两 Tab 设置页面重构为左侧导航 + 右侧内容的分栏布局，支持：
- LLM 模型（OpenAI / Claude / 本地模型）
- 图像生成（即梦 / Stable Diffusion / NanoBanana Pro）
- 视频生成（Veo 3.1 / NanoBanana Pro）
- 语音合成（TTS 服务）
- 存储与导出设置

## 二、文件结构

```
src/features/settings/
├── index.ts                    # 统一导出
├── SettingsPage.tsx            # 页面入口（状态管理 + 布局组装）
├── layout/
│   ├── SettingsLayout.tsx      # 左右分栏布局骨架
│   └── SettingsSidebar.tsx     # 左侧导航菜单
├── components/
│   ├── ProviderConfigCard.tsx  # 通用 Provider 配置卡片（核心复用组件）
│   └── SettingSection.tsx      # 右侧面板的标题/描述区域包装器
└── panels/                     # 各配置面板
    ├── GeneralPanel.tsx        # 通用偏好设置（主题等）
    ├── LLMPanel.tsx            # LLM 模型配置
    ├── ImageGenPanel.tsx       # 图像生成配置
    ├── VideoGenPanel.tsx       # 视频生成配置
    ├── TTSPanel.tsx            # 语音合成配置
    └── StoragePanel.tsx        # 存储与导出（迁移原有内容）
```

## 三、新增 shadcn/ui 组件

| 组件 | 用途 |
|------|------|
| `Select` | 默认 Provider 选择下拉框 |
| `Switch` | 布尔配置开关（启用/禁用等） |
| `Slider` | 参数调优（Temperature、语速等） |

> 注：不新增 Accordion，Provider 卡片直接在面板中垂直排列展示，保持简洁

## 四、实施步骤

### Step 1: 安装新增 shadcn/ui 组件
```bash
npx shadcn@latest add select switch slider
```

### Step 2: 创建布局组件

**SettingsLayout.tsx** - 左右分栏骨架：
- 左侧 `aside` 260px 固定宽度，毛玻璃背景
- 右侧 `main` 弹性宽度，ScrollArea 包裹
- 使用现有 CSS 变量系统

**SettingsSidebar.tsx** - 侧边栏导航：
- 导航项数据驱动，支持分组标签
- 分组：`通用` | `AI 服务`（LLM/图像/视频/语音）| `系统`（存储）
- 选中态：`bg-[var(--accent)]` 高亮
- 图标 + 文字布局，使用 lucide-react 图标

### Step 3: 创建通用组件

**ProviderConfigCard.tsx** - Provider 配置卡片：
```typescript
interface ProviderConfigCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  description?: string;
  isDefault?: boolean;        // 是否为默认 Provider
  isConfigured?: boolean;     // 是否已配置（显示状态指示）
  onSetDefault?: () => void;
  children: React.ReactNode;  // 具体配置表单
}
```
- 使用 `Card variant="inset"` 作为容器
- 顶部显示 Provider 名称 + 状态 Badge
- 「设为默认」按钮
- children 区域放置具体的 Input/Select/Slider

**SettingSection.tsx** - 面板标题区域：
```typescript
interface SettingSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}
```

### Step 4: 创建配置面板

每个面板结构一致：
1. `SettingSection` 标题说明
2. 默认 Provider 选择（Select）
3. 各 Provider 的 `ProviderConfigCard` 列表

**LLMPanel** 配置项：
| Provider | 配置项 |
|----------|--------|
| OpenAI | API Key, Base URL, 默认模型(Select), Temperature(Slider) |
| Claude | API Key, 默认模型(Select) |
| 本地模型 | 模型路径, API 端点地址 |

**ImageGenPanel** 配置项：
| Provider | 配置项 |
|----------|--------|
| 即梦 (Jimeng) | API Key |
| Stable Diffusion | API Key, 部署地址（本地/远程） |
| NanoBanana Pro | API Key |

**VideoGenPanel** 配置项：
| Provider | 配置项 |
|----------|--------|
| Veo 3.1 | API Key |
| NanoBanana Pro | API Key |

**TTSPanel** 配置项：
| Provider | 配置项 |
|----------|--------|
| TTS 服务 | API Key, 默认音色(Select), 语速(Slider), 音量(Slider) |

**GeneralPanel** 配置项：
- 主题切换（亮色/暗色/跟随系统）
- 语言选择
- 快捷键设置（预留）

**StoragePanel** - 从原 SettingsPage 迁移：
- 项目存储路径
- 缓存路径
- 缓存清理

### Step 5: 重写 SettingsPage.tsx
- 使用 `useState` 管理当前选中的导航项
- 组装 SettingsLayout + SettingsSidebar + 各 Panel
- 根据 activeId 条件渲染对应面板

### Step 6: 更新导出

## 五、设计规范

### 布局尺寸
- 侧边栏宽度：260px
- 右侧内容最大宽度：max-w-3xl（768px）
- 内容区内边距：p-8
- 卡片间距：space-y-6

### 颜色/样式
- 侧边栏背景：`bg-[var(--sidebar-background)]/60 backdrop-blur-xl`
- 导航选中态：`bg-[var(--accent)] text-[var(--accent-foreground)]`
- Provider 卡片：`Card variant="inset"`
- 状态指示：已配置=绿色 Badge, 未配置=灰色 Badge
- 默认 Provider：卡片左侧边框高亮 `border-l-2 border-[var(--primary)]`

### 交互
- 导航切换无动画（简洁直接）
- 所有配置项为静态 Mock（Phase 1 阶段）
- 密码框 `type="password"` 隐藏 API Key

## 六、不做的事情

- ❌ 不接入真实 API（Phase 1 只做 UI）
- ❌ 不实现数据持久化（后续 Phase 2）
- ❌ 不新增 Accordion 折叠（Provider 数量可控，直接展示）
- ❌ 不实现「验证连接」功能（后续阶段）
